import { GatewayPool } from "dvote-js"
import { useState, useEffect, createContext, useContext } from "react"

interface IPoolContext {
    pool: GatewayPool,
    resolvePool: Promise<GatewayPool>,
    loading: boolean,
    error: string,
    refresh: () => void
}

const UsePoolContext = createContext<IPoolContext>({ pool: null, resolvePool: null, loading: false, error: null, refresh: () => { } })

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
    const [resolvePool, setResolvePool] = useState<Promise<GatewayPool>>(null)
    const [pool, setPool] = useState<GatewayPool>(null)
    const [loading, setLoading] = useState<boolean>(false)
    const [error, setError] = useState<string>(null)

    // Initial load
    useEffect(() => {
        let newPool: GatewayPool

        setLoading(true)

        const prom = GatewayPool.discover({
            bootnodesContentUri: process.env.BOOTNODES_URL,
            networkId: process.env.ETH_NETWORK_ID as any,
        }).then(discoveredPool => {
            newPool = discoveredPool

            return newPool.init()
        }).then(() => {
            setPool(newPool)
            setError(null)
            setLoading(false)

            return newPool
        }).catch(err => {
            setLoading(false)
            setError(err && err.message || err?.toString())
            throw err
        })
        setResolvePool(prom)

        // Cleanup
        return () => {
            pool?.disconnect?.()
        }
    }, [])

    // Manual refresh
    const refresh = () => {
        if (!pool) return

        setLoading(true)
        const prom = pool.refresh().then(() => {
            setLoading(false)
            return pool
        }).catch(err => {
            setLoading(false)
            setError(err && err.message || err?.toString())
            throw err
        })
        setResolvePool(prom)
    }

    return (
        <UsePoolContext.Provider value={{ pool, resolvePool, loading, error, refresh }}>
            {children}
        </UsePoolContext.Provider>
    )
}
