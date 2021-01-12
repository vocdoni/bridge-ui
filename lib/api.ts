import { ProcessContractParameters, ProcessMetadata, VotingApi } from "dvote-js"
import { YOU_ARE_NOT_CONNECTED } from "./errors"
import { allTokens } from "./tokens"
import { Token } from "./types"
import { getPool } from "./vochain"

export function getTokenProcesses(filterTokenAddress?: string): Promise<{ metadata: ProcessMetadata, parameters: ProcessContractParameters, token: Token, id: string }[]> {
    const pool = getPool()
    if (!pool) return Promise.reject(new Error(YOU_ARE_NOT_CONNECTED))

    const tokenAddrs = filterTokenAddress ?
        [filterTokenAddress] :
        allTokens.map(token => token.address)

    let result: { metadata: ProcessMetadata, parameters: ProcessContractParameters, token: Token, id: string }[] = []

    return Promise.all(tokenAddrs.map(tokenAddr => {
        const tokenProms = getProcessList(tokenAddr)
            .then(processIds => {
                return Promise.all(processIds.map(processId =>
                    Promise.all([
                        VotingApi.getProcessMetadata(processId, pool),
                        VotingApi.getProcessParameters(processId, pool)
                    ]).then(results => {
                        result.push({
                            metadata: results[0],
                            parameters: results[1],
                            token: allTokens.find(t => t.address == tokenAddr),
                            id: processId
                        })
                    })
                ))
            })

        return tokenProms
    })).then(() => result)
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
