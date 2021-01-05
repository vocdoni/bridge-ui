import { createContext } from 'react'
import { Wallet } from 'ethers'
// import { DVoteGateway } from 'dvote-js/dist/net/gateway'

export interface IAppContext {
    // web3Wallet: Web3Wallet,
    onNewWallet: (wallet: Wallet) => any,
    entityId: string,
    processId: string,
    urlHash: string,
    setTitle: (title: string) => void
    onGatewayError: (type: 'private' | 'public') => void
    setEntityId: (entityId: string) => void
    setProcessId: (processId: string) => void,
    setUrlHash: (urlHash: string) => void,
}

// Global context provided to every page
const AppContext = createContext<IAppContext>(null)

export default AppContext
