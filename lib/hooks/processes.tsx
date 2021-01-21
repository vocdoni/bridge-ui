import React, { useCallback, useContext, useEffect, useRef, useState } from 'react'
import { getProcessInfo } from '../api'
import { ProcessInfo } from '../types'
import { usePool } from './pool'

const UseProcessContext = React.createContext<{
    fetchProcessInfo: (processId: string) => Promise<ProcessInfo>,
    refreshProcessInfo: (processId: string) => Promise<ProcessInfo>
}>(null)

export function useProcess(processId: string) {
    const processContext = useContext(UseProcessContext)
    const [processInfo, setProcessInfo] = useState<ProcessInfo>(null)

    if (processContext === null) {
        throw new Error(
            'useProcess() can only be used inside of <UseProcessProvider />, ' +
            'please declare it at a higher level.'
        )
    }

    useEffect(() => {
        let ignore = false

        const update = () => {
            processContext.fetchProcessInfo(processId)
                .then(newInfo => {
                    if (ignore) return
                    setProcessInfo(newInfo)
                })
        }
        update()

        return () => {
            ignore = true
        }
    }, [processId])

    return processInfo
}

export function UseProcessProvider({ children }) {
    const processes = useRef(new Map<String, ProcessInfo>())
    const { pool, loadingPromise: poolLoadingPromise } = usePool()

    const fetchProcessInfo: (processId: string) => Promise<ProcessInfo> =
        useCallback(async (processId: string) => {
            if (processes.current.has(processId)) {
                return processes.current.get(processId)
            }
            return loadProcessInfo(processId)
        }, [])

    const loadProcessInfo = async (processId: string) => {
        if (poolLoadingPromise) await poolLoadingPromise

        return getProcessInfo(processId, pool)
            .then(processInfo => {
                processes.current.set(processId, processInfo)
                return processInfo
            })
    }

    return (
        <UseProcessContext.Provider
            value={{ fetchProcessInfo, refreshProcessInfo: loadProcessInfo }}
        >
            {children}
        </UseProcessContext.Provider>
    )
}
