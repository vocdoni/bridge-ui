import { useContext, Component, useState, useEffect } from 'react'
import { ProcessMetadata, VotingApi } from 'dvote-js'

import { usePool, useProcesses } from '@vocdoni/react-hooks'
import { useToken } from '../../lib/hooks/tokens'
import { useUrlHash } from 'use-url-hash'
import TokenCard from '../../components/token-card'
import { Button } from '@aragon/ui'
import Router from 'next/router'
import { WalletStatus } from '../../components/wallet-status'
import { getProcessList, getTokenProcesses } from '../../lib/api'
import { FALLBACK_TOKEN_ICON } from '../../lib/constants'
import Spinner from "react-svg-spinner"


// MAIN COMPONENT
const TokenPage = props => {
    const { poolPromise } = usePool()
    const tokenAddr = useUrlHash().substr(1)
    const [loadingProcesses, setLoadingProcesses] = useState(true)
    const [blockNumber, setBlockNumber] = useState(-1)
    const [processIds, setProcessIds] = useState([] as string[])
    const { processes, error, loading } = useProcesses(processIds || [])
    const token = useToken(tokenAddr)

    const allProcessesLoaded = processIds.every(id => processes.has(id))

    // Effects

    useEffect(() => {
        const interval = setInterval(() => updateBlockHeight, 1000 * 13)
        updateBlockHeight()

        // Done
        return () => clearInterval(interval)
    }, [])

    useEffect(() => {
        const interval = setInterval(() => updateProcessIds, 1000 * 60)
        updateProcessIds()

        // Done
        return () => clearInterval(interval)
    }, [tokenAddr])

    // Loaders

    const updateBlockHeight = () => {
        poolPromise
            .then(pool => VotingApi.getBlockHeight(pool))
            .then(num => setBlockNumber(num))
            .catch(err => console.error(err))
    }
    const updateProcessIds = () => {
        if (!tokenAddr) return
        setLoadingProcesses(true)

        poolPromise
            .then(pool => getProcessList(tokenAddr, pool))
            .then(ids => {
                setLoadingProcesses(false)
                setProcessIds(ids)
            })
            .catch(err => {
                setLoadingProcesses(false)

                console.error(err)
                alert("The list of processes could not be loaded")
            })
    }

    // Callbacks

    const onCreateProcess = (tokenAddress: string) => {
        if (!tokenAddress) return
        Router.push("/processes/new#/" + tokenAddress)
    }

    const upcomingProcesses = processIds.filter(
        id => processes.has(id) && blockNumber < processes.get(id).parameters.startBlock
    )
    const activeProcesses = processIds.filter(
        id => processes.has(id) && blockNumber >= processes.get(id).parameters.startBlock &&
            blockNumber < (processes.get(id).parameters.startBlock + processes.get(id).parameters.blockCount)
    )
    const endedProcesses = processIds.filter(
        id => processes.has(id) && blockNumber >= (processes.get(id).parameters.startBlock + processes.get(id).parameters.blockCount)
    )

    return <div id="token-info">
        <div className="page-head">
            <div className="left">
                <h1>Token details</h1>
                <h4 className="accent-1">See the details of {token?.symbol || "the token"}</h4>
            </div>
            <div className="right">
                <WalletStatus />
                <div>
                    <Button mode="strong" wide onClick={() => onCreateProcess(token?.address)}>Create a governance process</Button>
                </div>
            </div>
        </div>

        <div className="row-summary">
            <div className="item">
                <p className="accent-1">Token symbol</p>
                <h4>{token?.symbol || "-"}</h4>
            </div>
            <div className="item">
                <p className="accent-1">Token name</p>
                <h4>{token?.name || "-"}</h4>
            </div>
            <div className="item">
                <p className="accent-1">Total supply</p>
                <h4>{token?.totalSupply || "-"}</h4>
            </div>
            <div className="item">
                <p className="accent-1">Token address</p>
                <h4 className="address">{token?.address || "-"}</h4>
            </div>
        </div>

        <div className="row-main">
            <h2>Active votes</h2>
            <p className="light">{
                endedProcesses.length ?
                    "Below are the votes belonging to the available tokens." :
                    "There are no active votes at this moment."
            }</p>

            <div className="token-list">
                {
                    (loadingProcesses || !allProcessesLoaded) ? <Spinner /> :
                        activeProcesses.map((id, idx) => <TokenCard name={token?.symbol} icon={FALLBACK_TOKEN_ICON} rightText="" href={id ? ("/processes#/" + id) : ""} key={idx}>
                            <p>{processes.get(id).metadata.title.default || "No title"}</p>
                        </TokenCard>)
                }
            </div>
        </div>

        <div className="row-main">
            <h2>Vote results</h2>
            <p className="light">{
                endedProcesses.length ?
                    "Below are the results for votes related to your tokens." :
                    "There are no votes with results to display."
            }</p>

            <div className="token-list">
                {
                    (loadingProcesses || !allProcessesLoaded) ? <Spinner /> :
                        endedProcesses.map((id, idx) => <TokenCard name={token?.symbol} icon={FALLBACK_TOKEN_ICON} rightText="" href={id ? ("/processes#/" + id) : ""} key={idx}>
                            <p>{processes.get(id).metadata.title.default || "No title"}</p>
                        </TokenCard>)
                }
            </div>
        </div>

        <div className="row-main">
            <h2>Upcoming votes</h2>
            <p className="light">{
                upcomingProcesses.length ?
                    "Below are the votes scheduled to start soon." :
                    "There are no votes scheduled to start soon."
            }</p>

            <div className="token-list">
                {
                    (loadingProcesses || !allProcessesLoaded) ? <Spinner /> :
                        upcomingProcesses.map((id, idx) => <TokenCard name={token?.symbol} icon={FALLBACK_TOKEN_ICON} rightText="" href={id ? ("/processes#/" + id) : ""} key={idx}>
                            <p>{processes.get(id).metadata.title.default || "No title"}</p>
                        </TokenCard>)
                }
            </div>
        </div>

    </div >
}

export default TokenPage
