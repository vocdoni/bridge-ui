import { Signer, providers } from "ethers"
import { INVALID_CHAIN_ID, METAMASK_IS_NOT_AVAILABLE } from "./errors"

let provider: providers.Web3Provider
let signer: Signer
let holderAddress: string

export function connectWeb3(): Promise<any> {
    if (!window || !window["ethereum"] || !window["ethereum"].enable)
        return Promise.reject(new Error(METAMASK_IS_NOT_AVAILABLE))

    return window["ethereum"].enable().then((addresses: string[]) => {
        provider = new providers.Web3Provider(window["ethereum"])
        signer = provider.getSigner()

        if (addresses && addresses.length) {
            holderAddress = addresses[0]
        } else {
            return updateHolderAddress()
        }
    }).then(() => checkChainId())
}

export function isWeb3Ready(): boolean {
    return provider && provider._isProvider && signer && signer._isSigner
}

export function getWeb3() {
    return { provider, signer, holderAddress }
}

function checkChainId() {
    if (!isWeb3Ready()) return Promise.reject()

    return provider.getNetwork().then((network: providers.Network) => {
        if (network.chainId != process.env.ETH_CHAIN_ID as any) {
            throw new Error(INVALID_CHAIN_ID)
        }
    })
}

function updateHolderAddress() {
    if (!isWeb3Ready()) return Promise.reject()

    return signer.getAddress().then((addr: string) => {
        if (holderAddress != addr) holderAddress = addr
    })
}
