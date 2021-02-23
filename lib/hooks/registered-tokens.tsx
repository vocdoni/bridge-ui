import React, { useCallback, useContext, useEffect, useRef, useState } from 'react'
import { getRegisteredTokenList } from '../api'
import { TokenListCache } from "../storage"
import { usePool } from '@vocdoni/react-hooks'
import { useMessageAlert } from './message-alert'

const UseRegisteredTokensContext = React.createContext<{
    registeredTokens: string[],
    error?: string
}>(null)

/** Returns an arran containing the list of registered ERC20 tokens */
export function useRegisteredTokens() {
    const tokenContext = useContext(UseRegisteredTokensContext)

    if (tokenContext === null) {
        throw new Error(
            'useRegisteredTokens() can only be used inside of <UseRegisteredTokens />, ' +
            'please declare it at a higher level.'
        )
    }
    return tokenContext
}

export function UseRegisteredTokens({ children }) {
    const { poolPromise } = usePool()
    const [registeredTokens, setRegisteredTokens] = useState<string[]>([])
    const [error, setError] = useState<string>(null)
    const { setAlertMessage } = useMessageAlert()

    const refreshRegisteredTokens = (currentTokenCount: number) => {
        return poolPromise.then(pool => getRegisteredTokenList(currentTokenCount, pool))
            .then(addrs => {
                // Do we have more tokens? Otherwise exit
                if (addrs === null) { return }

                setRegisteredTokens(addrs)

                const db = new TokenListCache()
                return db.write(addrs)
            })
            .catch(err => {
                setAlertMessage("Could not fetch the list of tokens")
            })
    }

    // Initial set up
    useEffect(() => {
        // Read the locally stored addresses
        const db = new TokenListCache()
        db.read().then(tokenAddrs => {
            // Set the address list in memory
            setRegisteredTokens(tokenAddrs)

            // Start a remote refresh of the tokens, the first time
            return refreshRegisteredTokens(tokenAddrs.length).catch(err => console.error(err))
        }).catch(err => {
            setError(err?.message || err?.toString?.() || "Could not fetch the registered token list")
        })
    }, [])

    return (
        <UseRegisteredTokensContext.Provider
            value={{ registeredTokens, error }}
        >
            {children}
        </UseRegisteredTokensContext.Provider>
    )
}
