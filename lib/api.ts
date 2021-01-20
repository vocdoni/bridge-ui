import { CensusErc20Api, ProcessContractParameters, ProcessMetadata, VotingApi } from "dvote-js"
import { NO_TOKEN_BALANCE, YOU_ARE_NOT_CONNECTED } from "./errors"
import { allTokens } from "./tokens"
import { ProcessInfo, Token } from "./types"
import { connectVochain, getPool } from "./vochain"
import { BigNumber, Contract, providers } from "ethers"
import { getWeb3 } from "./web3"
import TokenAmount from "token-amount"

// VOCDONI API's

export function ensureConnectedVochain() {
    if (getPool()) return Promise.resolve()

    return connectVochain().then(() => {
        const pool = getPool()
        if (!pool) return Promise.reject(new Error(YOU_ARE_NOT_CONNECTED))
    })
}

export async function getTokenProcesses(filterTokenAddress?: string): Promise<{ metadata: ProcessMetadata, parameters: ProcessContractParameters, token: Token, id: string }[]> {
    await ensureConnectedVochain()

    const tokenAddrs = filterTokenAddress ?
        [filterTokenAddress] :
        allTokens.map(token => token.address)

    const processesByToken = await Promise.all(
        tokenAddrs.map(tokenAddr => getProcessList(tokenAddr)
            .then(tokenProcessIds => Promise.all(tokenProcessIds.map(
                processId => getProcessInfo(processId))
            ))
        ))
    return processesByToken.reduce((prev, cur) => prev.concat(cur), [])
}

export async function getProcessInfo(processId: string): Promise<ProcessInfo> {
    await ensureConnectedVochain()
    const pool = getPool()

    const results = await Promise.all([
        VotingApi.getProcessMetadata(processId, pool),
        VotingApi.getProcessParameters(processId, pool)
    ])

    let token = {} as Token
    if (allTokens && allTokens.length)
        token = allTokens.find(t => t.address.toLowerCase() == results[1].entityAddress.toLowerCase())

    return {
        metadata: results[0],
        parameters: results[1],
        token,
        id: processId // pass-through to have the value for links
    }
}

export async function getProcessList(tokenAddress: string): Promise<string[]> {
    let result: string[] = []
    let lastId: string = undefined

    const pool = getPool()
    if (!pool) return Promise.reject(new Error(YOU_ARE_NOT_CONNECTED))

    while (true) {
        const processList = await VotingApi.getProcessList(tokenAddress, pool, lastId)
        if (processList.length == 0) return result

        result = result.concat(processList.map(id => "0x" + id))
        lastId = processList[processList.length - 1]
    }
}

export async function registerToken(tokenAddress: string, holderAddress: string) {
    try {
        await ensureConnectedVochain()
        const pool = getPool()
        const { signer } = getWeb3()

        const tokenBalanceMappingPosition = await findTokenBalanceMappingPosition(tokenAddress, holderAddress)
        const blockNumber = await pool.provider.getBlockNumber()
        const balanceSlot = CensusErc20Api.getHolderBalanceSlot(holderAddress, tokenBalanceMappingPosition)
        const result = await CensusErc20Api.generateProof(tokenAddress, [balanceSlot], blockNumber, pool.provider as providers.JsonRpcProvider)
        const { blockHeaderRLP, accountProofRLP, storageProofsRLP } = result

        await CensusErc20Api.registerToken(
            tokenAddress,
            tokenBalanceMappingPosition,
            blockNumber,
            Buffer.from(blockHeaderRLP.replace("0x", ""), "hex"),
            Buffer.from(accountProofRLP.replace("0x", ""), "hex"),
            Buffer.from(storageProofsRLP[0].replace("0x", ""), "hex"),
            signer,
            pool
        )
    }
    catch (err) {
        if (err && err.message == NO_TOKEN_BALANCE) throw err
        throw new Error("The token internal details cannot be chacked")
    }
}

export async function findTokenBalanceMappingPosition(tokenAddress: string, holderAddress: string) {
    const verify = true
    try {
        await ensureConnectedVochain()
        const pool = getPool()
        const blockNumber = await pool.provider.getBlockNumber()
        const balance = await balanceOf(tokenAddress, holderAddress)
        if (balance.isZero()) throw new Error(NO_TOKEN_BALANCE)

        for (let i = 0; i < 50; i++) {
            const tokenBalanceMappingPosition = i

            const balanceSlot = CensusErc20Api.getHolderBalanceSlot(holderAddress, tokenBalanceMappingPosition)

            const result = await CensusErc20Api
                .generateProof(tokenAddress, [balanceSlot], blockNumber, pool.provider as providers.JsonRpcProvider, { verify })
                .catch(() => null) // Failed => ignore

            if (result == null || !result.proof) continue

            const onChainBalance = BigNumber.from(result.proof.storageProof[0].value)
            if (!onChainBalance.eq(balance)) {
                console.warn("The proved balance does not match the on-chain balance:", result.proof.storageProof[0].value, "vs", balance.toHexString())
                continue
            }

            // FOUND
            return tokenBalanceMappingPosition
        }
        return null
    }
    catch (err) {
        throw err
    }
}

// ERC20 API

const ERC20_ABI = [
    // Read-Only Functions
    "function name() public view returns (string)",
    "function symbol() public view returns (string)",
    "function decimals() public view returns (uint8)",
    "function balanceOf(address _owner) public view returns (uint256 balance)",
    "function totalSupply() public view returns (uint256)",
]

export function getTokenInfo(address: string) {
    return ensureConnectedVochain().then(() => {
        const pool = getPool()
        const tokenInstance = new Contract(address, ERC20_ABI, pool.provider)

        return Promise.all([
            tokenInstance.name(),
            tokenInstance.symbol(),
            tokenInstance.totalSupply(),
            tokenInstance.decimals()
        ])
    }).then(items => {
        const supplyStr = items[2].toString() as string
        const totalSupply = new TokenAmount(supplyStr, items[3], { symbol: items[1] }).format()

        return {
            name: items[0] as string,
            symbol: items[1] as string,
            totalSupply,
            decimals: items[3],
            address
        }
    })
}

export function balanceOf(tokenAddress: string, holderAddress: string): Promise<BigNumber> {
    return ensureConnectedVochain().then(() => {
        const pool = getPool()
        const tokenInstance = new Contract(tokenAddress, ERC20_ABI, pool.provider)

        return tokenInstance.balanceOf(holderAddress)
    })
}

export function hasBalance(tokenAddress: string, holderAddress: string): Promise<boolean> {
    return ensureConnectedVochain().then(() => {
        const pool = getPool()
        const tokenInstance = new Contract(tokenAddress, ERC20_ABI, pool.provider)

        return tokenInstance.balanceOf(holderAddress)
    }).then(balance => {
        return !balance.isZero()
    })
}
