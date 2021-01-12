import { Signer, providers } from "ethers"
import { INVALID_CHAIN_ID } from "./errors"

let provider: providers.Web3Provider
let signer: Signer

export function connectWeb3(): Promise<any> {
    return window["ethereum"].enable().then(() => {
        provider = new providers.Web3Provider(window["ethereum"])
        signer = provider.getSigner()

        return provider.getNetwork()
    }).then((network: providers.Network) => {
        if (network.chainId != process.env.ETH_CHAIN_ID as any) {
            throw new Error(INVALID_CHAIN_ID)
        }
    })
}

export function isWeb3Ready(): boolean {
    return provider && provider._isProvider && signer && signer._isSigner
}

export function getWeb3() {
    return { provider, signer }
}
