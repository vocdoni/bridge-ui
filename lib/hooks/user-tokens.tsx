import React, { useContext, useEffect, useState } from 'react'
import { useMessageAlert } from './message-alert'
import { useWallet } from "use-wallet";
import { Contract, Provider, setMulticallAddress } from 'ethers-multicall';
import { providers } from 'ethers';
import { useRegisteredTokens } from "../../lib/hooks/registered-tokens";
import { tokenAbi as abi, GOERLI_MULTICALL, GOERLI_CHAINID } from '../constants'
import { TokenBalance } from '../types'

const UseUserTokensContext = React.createContext<{
    userTokens: TokenBalance[],
    refreshUserTokens: (userTokenAddrs: string[]) => Promise<TokenBalance[]>,
    error?: string
}>({ userTokens: [], refreshUserTokens: () => Promise.reject(new Error("Not initialized")) })

/** Returns an array containing the list of registered ERC20 tokens */
export function useUserTokens() {
  const userTokenContext = useContext(UseUserTokensContext)

  if (userTokenContext === null) {
      throw new Error(
          'useRegisteredTokens() can only be used inside of <UseRegisteredTokens />, ' +
          'please declare it at a higher level.'
      )
  }
  return userTokenContext
}

export function UseUserTokens({ children }) {
    const [userTokens, setUserTokens] = useState<TokenBalance[]>([])
    const [error, setError] = useState<string>(null)
    const { registeredTokens } = useRegisteredTokens();
    const { setAlertMessage } = useMessageAlert()
    const wallet = useWallet<providers.JsonRpcFetchFunc>();
    
    const refreshUserTokens = async (tokenAddresses: string[]): Promise<TokenBalance[]> => {
        if (!wallet?.ethereum || !wallet?.account) {
            setError('No wallet connected')
            return []
        }
        if (wallet.chainId === GOERLI_CHAINID) setMulticallAddress(wallet.chainId, GOERLI_MULTICALL)

        const provider = new providers.Web3Provider(wallet.ethereum);
        const ethcallProvider = new Provider(provider, wallet.chainId);
        const contractCalls = tokenAddresses.map(address => (new Contract(address, abi)).balanceOf(wallet.account))
        return ethcallProvider.all(contractCalls)
            .then(balances => {
                return tokenAddresses.flatMap((address, index) => (balances[index] == 0) ? [] : [{ address, balance: balances[index].toString() }])
            })
            .catch(err => {
                setAlertMessage("Could not fetch the list of user tokens")
                return []
            })
    }

    // Initial set up
    useEffect(() => {
        refreshUserTokens(registeredTokens).then(balances => setUserTokens(balances))
    }, [wallet, registeredTokens])

    return (
        <UseUserTokensContext.Provider
            value={{ userTokens, refreshUserTokens, error }}
        >
          { children }
        </UseUserTokensContext.Provider>
    )
}
