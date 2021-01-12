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

export function getTokenProcesses(filterTokenAddress?: string): Promise<{ metadata: ProcessMetadata, parameters: ProcessContractParameters, token: Token, id: string }[]> {
    return ensureConnectedVochain()
        .then(() => {
            const tokenAddrs = filterTokenAddress ?
                [filterTokenAddress] :
                allTokens.map(token => token.address)

            let result: { metadata: ProcessMetadata, parameters: ProcessContractParameters, token: Token, id: string }[] = []

            return Promise.all(tokenAddrs.map(tokenAddr => {
                const tokenProms = getProcessList(tokenAddr)
                    .then(processIds => {
                        return Promise.all(
                            processIds.map(processId => getProcessInfo(processId))
                        )
                    })

                return tokenProms
            })).then((processesByToken) => {
                return processesByToken.reduce((prev, cur) => prev.concat(cur), [])
            })
        })
}

export function getProcessInfo(id: string): Promise<ProcessInfo> {
    return ensureConnectedVochain().then(() => {
        const pool = getPool()

        return Promise.all([
            VotingApi.getProcessMetadata(id, pool),
            VotingApi.getProcessParameters(id, pool)
        ])
    }).then(results => {
        const token = allTokens && allTokens.find(t => t.address.toLowerCase() == results[1].entityAddress.toLowerCase()) || {} as Token
        return {
            metadata: results[0],
            parameters: results[1],
            token,
            id // pass-through to have the value for links
        }
    })
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
