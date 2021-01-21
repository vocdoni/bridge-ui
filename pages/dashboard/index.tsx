import { useEffect, useState } from 'react'
import { VotingApi } from 'dvote-js'
import Spinner from "react-svg-spinner"

import TokenCard from '../../components/token-card'
import Select from 'react-select'
import { allTokens } from '../../lib/tokens'
import { getProcessList, getTokenProcesses } from '../../lib/api'
// import { strDateDiff } from '../../lib/date'
import { ProcessInfo } from '../../lib/types'
import { limitedText } from '../../lib/util'
import { WalletStatus } from '../../components/wallet-status'
import { usePool } from '../../lib/hooks/pool'
import { useToken } from '../../lib/hooks/tokens'
import { useProcess } from '../../lib/hooks/processes'

// MAIN COMPONENT
const DashboardPage = props => {
    const { pool, loadingPromise: poolLoadingPromise } = usePool()
    const [blockNumber, setBlockNumber] = useState(0)
    const [loadingProcesses, setLoadingProcesses] = useState(false)
    const [processes, setProcesses] = useState<ProcessInfo[]>([])
    const [targetTokenAddress, setTargetTokenAddress] = useState(null as string)

    const tokenAddrs = targetTokenAddress ? [targetTokenAddress] : allTokens

    // Block update
    useEffect(() => {
        const interval = setInterval(async () => {
            if (poolLoadingPromise) await poolLoadingPromise
            setBlockNumber(await VotingApi.getBlockHeight(pool))
        }, 1000 * 15)

        // Done
        return () => clearInterval(interval)
    }, [])

    // Process list fetch
    useEffect(() => {
        let skip = false
        const p = poolLoadingPromise || Promise.resolve()

        setLoadingProcesses(true)

        p.then(() => {
            return Promise.all(tokenAddrs.map(addr => getTokenProcesses(addr, pool)))
        }).then(processArrays => {
            if (skip) return

            const procs = processArrays.reduce((prev, cur) => prev.concat(cur), [])
            setProcesses(procs)
            setLoadingProcesses(false)
        }).catch(err => {
            setLoadingProcesses(false)
        })

        return () => { skip = true }
    }, [targetTokenAddress])

    // RENDER

    // const options = allTokens.map(token => ({ label: token.name, value: token.symbol }))
    // options.unshift({ label: "(all tokens)", value: "" })

    const upcomingProcesses = processes.filter(
        proc => blockNumber < proc.parameters.startBlock
    )
    const activeProcesses = processes.filter(
        proc => blockNumber >= proc.parameters.startBlock &&
            blockNumber < (proc.parameters.startBlock + proc.parameters.blockCount)
    )
    const endedProcesses = processes.filter(
        proc => blockNumber >= (proc.parameters.startBlock + proc.parameters.blockCount)
    )

    return <div id="dashboard">
        <div className="page-head">
            <div className="left">
                <h1>My Dashboard</h1>
                <h4 className="accent-1">Vote on the open processes and see the results of the ones that already ended.</h4>
            </div>
            <div className="right">
                <WalletStatus />
                {/* <Select options={options} onChange={(value, options) => this.onTokenFilter(value, options)} /> */}
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
                    loadingProcesses ? <Spinner /> :
                        activeProcesses.map(proc => renderProcessCard({ processId: proc.id, tokenAddress: proc.tokenAddress }))
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
                    loadingProcesses ? <Spinner /> :
                        endedProcesses.map(proc => renderProcessCard({ processId: proc.id, tokenAddress: proc.tokenAddress }))
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
                    loadingProcesses ? <Spinner /> :
                        upcomingProcesses.map(proc => renderProcessCard({ processId: proc.id, tokenAddress: proc.tokenAddress }))
                }
            </div>
        </div>
    </div>
}

const renderProcessCard = ({ processId, tokenAddress }: { processId: string, tokenAddress: string }) => {
    const token = useToken(tokenAddress)
    const proc = useProcess(processId)
    const icon = process.env.ETH_NETWORK_ID == "goerli" ?
        "https://cdn.worldvectorlogo.com/logos/dai-2.svg" : token.icon

    return <TokenCard key={processId} name={token?.symbol} icon={icon} rightText={/*strDateDiff()*/""} href={"/processes#/" + processId}>
        <p>
            <strong>{limitedText(proc?.metadata?.title?.default, 35) || "No title"}</strong>
            <br />
            {limitedText(proc?.metadata?.description?.default) || "No description"}
        </p>
    </TokenCard>
}
