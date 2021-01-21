import React, { useCallback, useContext, useEffect, useRef, useState } from 'react'
import { getTokenInfo } from '../api'
import { TokenInfo } from '../types'
import { usePool } from './pool'

const UseTokenContext = React.createContext<{
    fetchTokenInfo: (address: string) => Promise<TokenInfo>,
    refreshTokenInfo: (address: string) => Promise<TokenInfo>
}>(null)

export function useToken(address: string) {
    const tokenContext = useContext(UseTokenContext)
    const [tokenInfo, setTokenInfo] = useState<TokenInfo>(null)

    if (tokenContext === null) {
        throw new Error(
            'useToken() can only be used inside of <UseTokenProvider />, ' +
            'please declare it at a higher level.'
        )
    }

    useEffect(() => {
        let ignore = false

        const update = () => {
            tokenContext.fetchTokenInfo(address)
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

    return tokenInfo
}

export function UseTokenProvider({ children }) {
    const tokens = useRef(new Map<String, TokenInfo>())
    const { pool, loadingPromise: poolLoadingPromise } = usePool()

    const fetchTokenInfo: (address: string) => Promise<TokenInfo> =
        useCallback(async (address: string) => {
            if (tokens.current.has(address)) {
                return tokens.current.get(address)
            }
            return loadTokenInfo(address)
        }, [])

    const loadTokenInfo = async (address: string) => {
        if (poolLoadingPromise) await poolLoadingPromise

        return getTokenInfo(address, pool)
            .then(tokenInfo => {
                tokens.current.set(address, tokenInfo)
                return tokenInfo
            })
    }

    return (
        <UseTokenContext.Provider
            value={{ fetchTokenInfo, refreshTokenInfo: loadTokenInfo }}
        >
            {children}
        </UseTokenContext.Provider>
    )
}
