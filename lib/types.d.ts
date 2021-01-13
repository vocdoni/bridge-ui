import { ProcessContractParameters, ProcessMetadata } from "dvote-js"

export type Token = {
    symbol: string,
    name: string,
    address: string,
    balanceMappingPosition: number
}

export type ProcessInfo = {
    metadata: ProcessMetadata,
    parameters: ProcessContractParameters,
    token: Token,
    id: string
}
