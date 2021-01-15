import { Identicon } from "./identicon"

export const WalletStatus = ({ address }: { address: string }) => {
    if (address) {
        return <div className="v-center">
            Signed in as {address.substr(0, 8)}...
            <a href={process.env.ETHERSCAN_PREFIX + "/address/" + address} target="_blank"><Identicon address={address} /></a>
        </div>
    }
    return <div className="v-center">(Metamask is not connected)</div>
}
