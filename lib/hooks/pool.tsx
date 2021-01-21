import { GatewayPool } from "dvote-js"
import { useState, useEffect, createContext, useRef, useCallback, useContext } from "react"

interface IPoolContext {
    pool: GatewayPool,
    loadingPromise: Promise<any>,
    error: string,
    refresh: () => void
}

const UsePoolContext = createContext<IPoolContext>({ pool: null, loadingPromise: null, error: null, refresh: () => { } })

export function usePool() {
    const poolContext = useContext(UsePoolContext)
    if (poolContext === null) {
        throw new Error(
            'usePool() can only be used on the descendants of <UsePoolProvider />, ' +
            'please declare it at a higher level.'
        )
    }
    return poolContext
}

export function UsePoolProvider({ children }) {
    const [loadingPromise, setLoadingPromise] = useState<Promise<any>>(null)
    const [pool, setPool] = useState<GatewayPool>(null)
    const [error, setError] = useState<string>(null)

    // Initial load
    useEffect(() => {
        let newPool: GatewayPool

        const prom = GatewayPool.discover({
            bootnodesContentUri: process.env.BOOTNODES_URL,
            networkId: process.env.ETH_NETWORK_ID as any,
        }).then(discoveredPool => {
            newPool = discoveredPool
            return pool.init()
        }).then(() => {
            setPool(newPool)
            setError(null)
            setLoadingPromise(null)
        }).catch(err => {
            setLoadingPromise(null)
            setError(err && err.message || err?.toString())
            throw err
        })

        setLoadingPromise(prom)

        // Cleanup
        return () => {
            pool?.disconnect?.()
        }
    }, [])

    // Manual refresh
    const refresh = () => {
        if (!pool) return

        const prom = pool.refresh().then(() => {
            setLoadingPromise(null)
        }).catch(err => {
            setLoadingPromise(null)
            setError(err && err.message || err?.toString())
            throw err
        })

        setLoadingPromise(prom)
    }

    return (
        <UsePoolContext.Provider value={{ pool, loadingPromise, error, refresh }}>
            {children}
        </UsePoolContext.Provider>
    )
}
