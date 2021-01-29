import React, { useCallback, useContext, useEffect, useRef, useState } from 'react'
import { getTokenInfo } from '../api'
import { TokenInfo } from '../types'
import { usePool } from '@vocdoni/react-hooks'

const UseTokenContext = React.createContext<{
    currentTokens: Map<string, TokenInfo>,
    resolveTokenInfo: (address: string) => Promise<TokenInfo>,
    refreshTokenInfo: (address: string) => Promise<TokenInfo>
}>(null)

export function useToken(address: string): TokenInfo | null {
    const tokenContext = useContext(UseTokenContext)
    const [tokenInfo, setTokenInfo] = useState<TokenInfo>(null)

    useEffect(() => {
        let ignore = false

        const update = () => {
            if (!address) return

            tokenContext.resolveTokenInfo(address)
                .then(newInfo => {
                    if (ignore) return
                    setTokenInfo(newInfo)
                }).catch(err => {
                    console.error(err)
                })
        }
        update()

        return () => {
            ignore = true
        }
    }, [address])

    if (tokenContext === null) {
        throw new Error(
            'useToken() can only be used inside of <UseTokenProvider />, ' +
            'please declare it at a higher level.'
        )
    }

    return tokenInfo
}

/** Returns an arran containing the available information about the given addresses */
export function useTokens(addresses: string[]) {
    const tokenContext = useContext(UseTokenContext)
    const [bool, setBool] = useState(false) // to force rerender
    const { pool } = usePool()

    useEffect(() => {
        if (!addresses || !addresses.length) return

        // Signal a refresh on the current token addresses
        Promise.all(addresses.map(address =>
            tokenContext.resolveTokenInfo(address)
        )).then(() => {
            setBool(!bool)
        }).catch(err => {
            console.error(err)
            setBool(!bool)
        })

        return () => { }
    }, [addresses])

    if (tokenContext === null) {
        throw new Error(
            'useTokens() can only be used inside of <UseTokenProvider />, ' +
            'please declare it at a higher level.'
        )
    }
    return tokenContext.currentTokens
}

export function UseTokenProvider({ children }) {
    // TODO: Use swr

    const tokens = useRef(new Map<string, TokenInfo>())
    const { poolPromise } = usePool()

    const resolveTokenInfo: (address: string) => Promise<TokenInfo> =
        useCallback((address: string) => {
            if (!address) return Promise.resolve(null)
            else if (tokens.current.has(address.toLowerCase())) { // cached
                return Promise.resolve(tokens.current.get(address.toLowerCase()))
            }
            return loadTokenInfo(address)
        }, [])

    const loadTokenInfo: (address: string) => Promise<TokenInfo> =
        useCallback((address: string) => {
            return poolPromise
                .then(pool => getTokenInfo(address, pool))
                .then(tokenInfo => {
                    tokens.current.set(address.toLowerCase(), tokenInfo)
                    return tokenInfo
                })
        }, [])

    return (
        <UseTokenContext.Provider
            value={{ currentTokens: tokens.current, resolveTokenInfo, refreshTokenInfo: loadTokenInfo }}
        >
            {children}
        </UseTokenContext.Provider>
    )
}
