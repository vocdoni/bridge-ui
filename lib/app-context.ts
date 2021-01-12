import { createContext } from 'react'
import { providers, Signer } from 'ethers'
import { GatewayPool } from 'dvote-js'

export interface IAppContext {
    provider: providers.JsonRpcProvider,
    signer: Signer,
    pool: GatewayPool,
    entityId: string,
    processId: string,
    urlHash: string,
    // setTitle: (title: string) => void
    // onGatewayError: (type: 'private' | 'public') => void
    setEntityId: (entityId: string) => void
    setProcessId: (processId: string) => void,
    setUrlHash: (urlHash: string) => void,
}

// Global context provided to every page
const AppContext = createContext<IAppContext>(null)

export default AppContext
