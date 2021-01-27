import { providers } from "ethers"
import { useWallet } from "use-wallet"

/** 
 * Extracts the underlying signer from the wallet provided by `useWallet()`.
 * IMPORTANT: Make sure that `<UseWalletProvider>` is loaded on a higher order component.
 * */
export function useSigner() {
    const wallet = useWallet()

    if (!wallet.ethereum || !wallet.account) return null

    const provider = new providers.Web3Provider(wallet.ethereum)
    return provider.getSigner()
}
