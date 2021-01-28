// import { Identicon } from "./identicon"
import { ChainUnsupportedError, ConnectionRejectedError, useWallet } from 'use-wallet'
import { LoadingRing, IconPower, IconEthereum, Button, AddressField, IdentityBadge, EthIdenticon, Field } from '@aragon/ui'

export const WalletStatus = () => {
    const wallet = useWallet()
    const activate = () => wallet.connect("injected").catch(err => console.error(err))

    // Error?
    if (wallet.error?.name) {
        if (wallet.error instanceof ChainUnsupportedError) {
            return <div id="wallet-status" className="v-center">
                <Button mode="negative" wide label={wallet.networkName + " is not enabled"} onClick={() => wallet.reset()}></Button>
            </div>
        } else if (wallet.error instanceof ConnectionRejectedError) {
            return <div id="wallet-status" className="v-center">
                <Button mode="negative" wide label="Wallet connection rejected" onClick={() => wallet.reset()}></Button>
            </div>
        }
        return <div id="wallet-status" className="v-center">
            <Button mode="negative" wide label="Web3 is unavailable" onClick={() => wallet.reset()}></Button>
        </div>
    }
    else if (wallet.status === 'connecting') {
        return (
            <div id="wallet-status" className="v-center">
                <Button label={"Connecting to " + wallet.networkName} icon={<LoadingRing />} wide onClick={() => wallet.reset()} />
            </div>
        )
    }
    else if (wallet.status === 'connected') {
        const icon = <Button icon={<IconPower />} size="mini" onClick={() => wallet.reset()} />

        return (
            <div id="wallet-status" className="v-center">
                <AddressField address={wallet.account} icon={icon} />
            </div>
        )
    }

    return (
        <div id="wallet-status" className="v-center">
            <Button label="Connect with MetaMask" icon={<IconEthereum />} wide onClick={() => activate()} />
        </div>
    )
}
