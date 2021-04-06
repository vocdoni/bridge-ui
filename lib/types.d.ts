import { ProcessContractParameters, ProcessMetadata } from "dvote-js"
import { BigNumber } from "ethers"

export type TokenInfo = {
    name: string,
    symbol: string,
    address: string,
    totalSupply: BigNumber,
    totalSupplyFormatted: string,
    decimals: number,
    balanceMappingPosition: number,
    icon: string,
    processes: string[]
}
export type TokenEntry = Omit<TokenInfo, "processes">

export type ProcessInfo = {
    id: string,
    metadata: ProcessMetadata,
    parameters: ProcessContractParameters,
    tokenAddress: string
}
