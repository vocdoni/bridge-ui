import React, { useCallback, useContext, useEffect, useRef, useState } from 'react'
import { getProcessInfo } from '../api'
import { UNAVAILABLE_POOL } from '../errors'
import { ProcessInfo } from '../types'
import { usePool } from './pool'

const UseProcessContext = React.createContext<{
    currentProcesses: Map<String, ProcessInfo>,
    resolveProcessInfo: (processId: string) => Promise<ProcessInfo>,
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
            if (!processId) return

            processContext.resolveProcessInfo(processId)
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

/** Returns an arran containing the available information about the given processIds */
export function useProcesses(processIds: string[]) {
    const processContext = useContext(UseProcessContext)
    const [bool, setBool] = useState(false) // to force rerender
    const { pool } = usePool()

    useEffect(() => {
        if (!processIds || processIds.length) return

        // Signal a refresh on the current token processIds
        Promise.all(processIds.map(address =>
            processContext.resolveProcessInfo(address)
        )).then(() => {
            setBool(!bool)
        }).catch(err => {
            console.error(err)
            setBool(!bool)
        })

        return () => { }
    }, [processIds, pool])

    if (processContext === null) {
        throw new Error(
            'useProcesses() can only be used inside of <UseProcessProvider />, ' +
            'please declare it at a higher level.'
        )
    }
    return processContext.currentProcesses
}

export function UseProcessProvider({ children }) {
    const processes = useRef(new Map<String, ProcessInfo>())
    const { pool, poolPromise } = usePool()

    const resolveProcessInfo: (processId: string) => Promise<ProcessInfo> =
        useCallback((processId: string) => {
            if (!processId) return Promise.resolve(null)
            else if (processes.current.has(processId)) { // cached
                return Promise.resolve(processes.current.get(processId))
            }
            return loadProcessInfo(processId)
        }, [])

    const loadProcessInfo: (processId: string) => Promise<ProcessInfo> =
        useCallback((processId: string) => {
            if (!poolPromise) return Promise.reject(new Error(UNAVAILABLE_POOL))

            return poolPromise
                .then(pool => getProcessInfo(processId, pool))
                .then(processInfo => {
                    processes.current.set(processId, processInfo)
                    return processInfo
                })
        }, [pool, poolPromise])

    return (
        <UseProcessContext.Provider
            value={{ currentProcesses: processes.current, resolveProcessInfo, refreshProcessInfo: loadProcessInfo }}
        >
            {children}
        </UseProcessContext.Provider>
    )
}
