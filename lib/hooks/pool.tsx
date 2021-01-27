import { GatewayPool } from "dvote-js"
import { useState, useEffect, createContext, useContext } from "react"

interface IPoolContext {
    pool: GatewayPool,
    poolPromise: Promise<GatewayPool>,
    loading: boolean,
    error: string,
    refresh: () => void
}

const UsePoolContext = createContext<IPoolContext>({ pool: null, poolPromise: null, loading: false, error: null, refresh: () => { } })

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
    // Promise holder for the very first iterations where resolvePool is still unset
    let resolvePoolPromise: (pool: GatewayPool) => any
    let poolPromise: Promise<GatewayPool>

    const [pool, setPool] = useState<GatewayPool>(null)
    const [loading, setLoading] = useState<boolean>(false)
    const [error, setError] = useState<string>(null)

    // Initial load
    useEffect(() => {
        let newPool: GatewayPool

        setLoading(true)

        GatewayPool.discover({
            bootnodesContentUri: process.env.BOOTNODES_URL,
            networkId: process.env.ETH_NETWORK_ID as any,
        }).then(discoveredPool => {
            newPool = discoveredPool

            return newPool.init()
        }).then(() => {
            setPool(newPool)
            setError(null)
            setLoading(false)

            // Notify early awaiters
            resolvePoolPromise?.(newPool)
            return newPool
        }).catch(err => {
            setLoading(false)
            setError(err && err.message || err?.toString())
            throw err
        })

        // Cleanup
        return () => {
            pool?.disconnect?.()
        }
    }, [])

    // Manual refresh
    const refresh = () => {
        if (!pool) return

        setLoading(true)
        pool.refresh().then(() => {
            setLoading(false)

            // Notify early awaiters
            resolvePoolPromise?.(pool)
            return pool
        }).catch(err => {
            setLoading(false)

            setError(err && err.message || err?.toString())
            throw err
        })
    }

    // Ensure that by default, resolvePool always has a promise
    if (pool == null) {
        poolPromise = new Promise<GatewayPool>((resolve) => { resolvePoolPromise = resolve })
    }
    else {
        poolPromise = Promise.resolve(pool)
    }

    return (
        <UsePoolContext.Provider value={{ pool, poolPromise, loading, error, refresh }}>
            {children}
        </UsePoolContext.Provider>
    )
}
