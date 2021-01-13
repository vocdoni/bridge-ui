import { createContext } from 'react'
import { providers, Signer } from 'ethers'
import { GatewayPool } from 'dvote-js'
import { ProcessInfo } from './types'

export interface IAppContext {
    provider?: providers.JsonRpcProvider,
    signer?: Signer,
    holderAddress?: string,
    pool?: GatewayPool,
    entityId: string,
    processId: string,
    urlHash: string,
    setEntityId: (entityId: string) => void
    setProcessId: (processId: string) => void,
    setUrlHash: (urlHash: string) => void,
}

// Global context provided to every page
const AppContext = createContext<IAppContext>(null)

export default AppContext
