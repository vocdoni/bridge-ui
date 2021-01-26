import { useContext, Component, useState, useEffect } from 'react'
import { ProcessMetadata, VotingApi } from 'dvote-js'
// import { message, Button, Spin, Divider, Input, Select, Col, Row, Card, Modal } from 'antd'
// import { LoadingOutlined, ExclamationCircleOutlined } from '@ant-design/icons'
// import { getEntityId } from 'dvote-js/dist/api/entity'
// import Router from 'next/router'

// import { getGatewayClients, getNetworkState } from '../../../lib/network'
import TokenCard from '../../components/token-card'
import { Button } from '@aragon/ui'
import Router from 'next/router'
import { WalletStatus } from '../../components/wallet-status'
import { ProcessInfo } from '../../lib/types'
import { YOU_ARE_NOT_CONNECTED } from '../../lib/errors'
import { getTokenInfo, getTokenProcesses } from '../../lib/api'
import { FALLBACK_TOKEN_ICON } from '../../lib/constants'
import { allTokens } from '../../lib/tokens'
import Spinner from "react-svg-spinner"
import { useUrlHash } from '../../lib/hooks/url-hash'
import { useToken } from '../../lib/hooks/tokens'
import { useProcess } from '../../lib/hooks/processes'
import { usePool } from '../../lib/hooks/pool'


// MAIN COMPONENT
const TokenPage = props => {
    const { pool } = usePool()
    const urlHash = useUrlHash()
    const [loadingProcesses, setLoadingProcesses] = useState(true)
    const [loadingToken, setLoadingToken] = useState(true)
    const [blockNumber, setBlockNumber] = useState(-1)
    const [processes, setProcesses] = useState([] as ProcessInfo[])
    const token = useToken(urlHash)

    useEffect(() => {
        if (!pool || !urlHash) return

        setLoadingToken(true)

        getTokenProcesses(urlHash, pool)
            .then((processes) => {
                // Only update the global list if not doing a filtered load
                setLoadingToken(false)
                setProcesses(processes)
            })
            .catch(err => {
                setLoadingToken(false)
                alert("The list of processes could not be loaded")
            })
    }, [pool])

    const onCreateProcess = (tokenAddress: string) => {
        if (!tokenAddress) return
        Router.push("/processes/new#/" + tokenAddress)
    }

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

    return <div id="token-info">
        <div className="page-head">
            <div className="left">
                <h1>Token details</h1>
                <h4 className="accent-1">See the details of {token?.symbol}</h4>
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
                    (loadingToken && loadingProcesses) ? <Spinner /> :
                        activeProcesses.map((proc, idx) => <TokenCard name={token?.symbol} icon={FALLBACK_TOKEN_ICON} rightText="" href={"/processes#/" + proc.id} key={idx}>
                            <p>{proc.metadata.title.default || "No title"}</p>
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
                    (loadingToken && loadingProcesses) ? <Spinner /> :
                        endedProcesses.map((proc, idx) => <TokenCard name={token?.symbol} icon={FALLBACK_TOKEN_ICON} rightText="" href={"/processes#/" + proc.id} key={idx}>
                            <p>{proc.metadata.title.default || "No title"}</p>
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
                    (loadingToken && loadingProcesses) ? <Spinner /> :
                        upcomingProcesses.map((proc, idx) => <TokenCard name={token?.symbol} icon={FALLBACK_TOKEN_ICON} rightText="" href={"/processes#/" + proc.id} key={idx}>
                            <p>{proc.metadata.title.default || "No title"}</p>
                        </TokenCard>)
                }
            </div>
        </div>

    </div >
}

export default TokenPage
