import { CensusErc20Api, GatewayPool, ProcessContractParameters, ProcessMetadata, VotingApi } from "dvote-js"
import { NO_TOKEN_BALANCE } from "./errors"
import { tokenIconUrl } from "use-token/dist/utils"
import { ProcessInfo, TokenInfo } from "./types"
import { BigNumber, Contract, providers, Signer } from "ethers"
import TokenAmount from "token-amount"

// VOCDONI API's

export async function getTokenProcesses(tokenAddr: string, pool: GatewayPool): Promise<ProcessInfo[]> {
    return getProcessList(tokenAddr, pool)
        .catch(err => {
            if (err?.message?.includes("Key not found")) { return [] as string[] }
            throw err
        })
        .then(tokenProcessIds => Promise.all(tokenProcessIds.map(
            processId => getProcessInfo(processId, pool))
        ))
}

export async function getProcessInfo(processId: string, pool: GatewayPool): Promise<ProcessInfo> {
    const results = await Promise.all([
        VotingApi.getProcessMetadata(processId, pool),
        VotingApi.getProcessParameters(processId, pool)
    ])

    return {
        metadata: results[0],
        parameters: results[1],
        id: processId, // pass-through to have the value for links
        tokenAddress: results[1].entityAddress
    }
}

export async function getProcessList(tokenAddress: string, pool: GatewayPool): Promise<string[]> {
    let result: string[] = []
    let lastId: string = undefined

    while (true) {
        const processList = await VotingApi.getProcessList(tokenAddress, pool, lastId)
        if (processList.length == 0) return result

        result = result.concat(processList.map(id => "0x" + id))
        lastId = processList[processList.length - 1]
    }
}

export async function registerToken(tokenAddress: string, holderAddress: string, pool: GatewayPool, signer: Signer) {
    try {
        const tokenBalanceMappingPosition = await findTokenBalanceMappingPosition(tokenAddress, holderAddress, pool)
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

export async function findTokenBalanceMappingPosition(tokenAddress: string, holderAddress: string, pool: GatewayPool) {
    const verify = true
    try {
        const blockNumber = await pool.provider.getBlockNumber()
        const balance = await balanceOf(tokenAddress, holderAddress, pool)
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

export function getTokenInfo(address: string, pool: GatewayPool): Promise<TokenInfo> {
    const tokenInstance = new Contract(address, ERC20_ABI, pool.provider)

    return Promise.all([
        tokenInstance.name(),
        tokenInstance.symbol(),
        tokenInstance.totalSupply(),
        tokenInstance.decimals(),
        CensusErc20Api.getBalanceMappingPosition(address, pool),
        getProcessList(address, pool)
    ]).then(([name, symbol, totalSupply, decimals, balMappingPos, pids]: [string, string, BigNumber, number, BigNumber, string[]]) => {
        return {
            name,
            symbol,
            totalSupply: new TokenAmount(totalSupply.toString(), decimals, { symbol }).format(),
            decimals,
            address,
            balanceMappingPosition: balMappingPos.toNumber(),
            icon: tokenIconUrl(address),
            processes: pids
        }
    })
}

export function balanceOf(tokenAddress: string, holderAddress: string, pool: GatewayPool): Promise<BigNumber> {
    const tokenInstance = new Contract(tokenAddress, ERC20_ABI, pool.provider)
    return tokenInstance.balanceOf(holderAddress)
}

export function hasBalance(tokenAddress: string, holderAddress: string, pool: GatewayPool): Promise<boolean> {
    const tokenInstance = new Contract(tokenAddress, ERC20_ABI, pool.provider)
    return tokenInstance.balanceOf(holderAddress).then(balance => !balance.isZero())
}
