import React, { useCallback, useContext, useEffect, useRef, useState } from 'react'
import { getTokenInfo } from '../api'
import { TokenInfo } from '../types'
import { usePool } from './pool'

const UseTokenContext = React.createContext<{
    currentTokens: Map<String, TokenInfo>,
    resolveTokenInfo: (address: string) => Promise<TokenInfo>,
    refreshTokenInfo: (address: string) => Promise<TokenInfo>
}>(null)

export function useToken(address: string) {
    const tokenContext = useContext(UseTokenContext)
    const [tokenInfo, setTokenInfo] = useState<TokenInfo>(null)

    useEffect(() => {
        let ignore = false

        const update = () => {
            tokenContext.resolveTokenInfo(address)
                .then(newInfo => {
                    if (ignore) return
                    setTokenInfo(newInfo)
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
    }, [addresses, pool])

    if (tokenContext === null) {
        throw new Error(
            'useTokens() can only be used inside of <UseTokenProvider />, ' +
            'please declare it at a higher level.'
        )
    }
    return tokenContext.currentTokens
}

export function UseTokenProvider({ children }) {
    const tokens = useRef(new Map<String, TokenInfo>())
    const { pool, resolvePool } = usePool()

    const resolveTokenInfo: (address: string) => Promise<TokenInfo> =
        useCallback((address: string) => {
            if (tokens.current.has(address.toLowerCase())) {
                return Promise.resolve(tokens.current.get(address))
            }
            return loadTokenInfo(address)
        }, [pool])

    const loadTokenInfo = (address: string) => {
        if (!resolvePool) return

        return resolvePool
            .then(pool => getTokenInfo(address, pool))
            .then(tokenInfo => {
                tokens.current.set(address.toLowerCase(), tokenInfo)
                return tokenInfo
            })
    }

    return (
        <UseTokenContext.Provider
            value={{ currentTokens: tokens.current, resolveTokenInfo, refreshTokenInfo: loadTokenInfo }}
        >
            {children}
        </UseTokenContext.Provider>
    )
}
