import { ProcessContractParameters, ProcessMetadata } from "dvote-js"

export type TokenInfo = {
    name: string,
    symbol: string,
    address: string,
    balanceMappingPosition: number,
    icon: string,
    processes: string[]
}

export type ProcessInfo = {
    id: string,
    metadata: ProcessMetadata,
    parameters: ProcessContractParameters,
    tokenAddress: string
}
