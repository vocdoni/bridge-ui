import { ProcessContractParameters, ProcessMetadata, VotingApi } from "dvote-js"
import { YOU_ARE_NOT_CONNECTED } from "./errors"
import { allTokens } from "./tokens"
import { ProcessInfo, Token } from "./types"
import { connectVochain, getPool } from "./vochain"

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
