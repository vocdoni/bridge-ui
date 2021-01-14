import { utils } from "ethers"
import IdenticonGen from "identicon.js"

export const Identicon = ({ address }: { address: string }) => {
    address = address.replace("0x", "")
    if (address.length < 15) address = utils.keccak256("0x" + address)
    const data = new IdenticonGen(address.replace("0x", ""), { format: 'svg' }).toString();

    return <img src={"data:image/svg+xml;base64," + data} />
}
