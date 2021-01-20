import { useContext, Component } from 'react'
import { ProcessMetadata, VotingApi } from 'dvote-js'
// import { message, Button, Spin, Divider, Input, Select, Col, Row, Card, Modal } from 'antd'
// import { LoadingOutlined, ExclamationCircleOutlined } from '@ant-design/icons'
// import { getEntityId } from 'dvote-js/dist/api/entity'
// import Router from 'next/router'

// import { getGatewayClients, getNetworkState } from '../../../lib/network'
import AppContext, { IAppContext } from '../../lib/app-context'
import TokenCard from '../../components/token-card'
import { Button } from '@aragon/ui'
import Router from 'next/router'
import { WalletStatus } from '../../components/wallet-status'
import { ProcessInfo } from '../../lib/types'
import { YOU_ARE_NOT_CONNECTED } from '../../lib/errors'
import { ensureConnectedVochain, getTokenInfo, getTokenProcesses } from '../../lib/api'
import { getPool } from '../../lib/vochain'
import { FALLBACK_TOKEN_ICON } from '../../lib/constants'
import { allTokens } from '../../lib/tokens'
import Spinner from "react-svg-spinner"


// MAIN COMPONENT
const TokenPage = props => {
    // Get the global context and pass it to our stateful component
    const context = useContext(AppContext)

    return <TokenView {...context} />
}

type State = {
    loading?: boolean,
    offline?: boolean, // unused
    processes: ProcessInfo[],
    blockNumber: number,
    tokenInfo?: {
        name: string;
        symbol: string;
        totalSupply: string;
        address: string;
    }
}

// Stateful component
class TokenView extends Component<IAppContext, State> {
    state: State = {
        processes: null,
        blockNumber: null
    }

    componentDidMount() {
        const tokenAddress = this.resolveTokenAddress()

        this.setState({ loading: true })

        return this.loadCurrentBlock()
            .then(() => this.loadTokenProcesses(tokenAddress))
            .then(() => getTokenInfo(tokenAddress))
            .then(tokenInfo => {
                this.setState({ loading: false, tokenInfo })
            })
            .catch(err => {
                this.setState({ loading: false })
                alert("Could not load the token details")
            })
    }

    resolveTokenAddress(): string {
        if (typeof window != "undefined") return location.hash.substr(2)
        else if (this.props.urlHash) return this.props.urlHash
        else return ""
    }

    async loadCurrentBlock() {
        await ensureConnectedVochain()
        const pool = getPool()

        const height = await VotingApi.getBlockHeight(pool)
        this.setState({ blockNumber: height })
    }

    loadTokenProcesses(targetTokenAddress: string) {
        this.setState({ loading: true })

        return getTokenProcesses(targetTokenAddress)
            .then((processes) => {
                // Only update the global list if not doing a filtered load
                this.setState({ loading: false, offline: false, processes })
            })
            .catch(err => {
                this.setState({ loading: false })

                if (err && err.message == YOU_ARE_NOT_CONNECTED) {
                    this.setState({ offline: true })
                    return
                }
                alert("The list of processes could not be loaded")
            })
    }

    onCreateProcess(tokenAddress: string) {
        Router.push("/processes/new#/" + tokenAddress)
    }

    render() {
        // const { holderAddress } = this.props
        const token = this.state.tokenInfo ||
            Object.assign({}, allTokens.find(t => t.address == this.resolveTokenAddress()), { totalSupply: <Spinner size={12} /> }) ||
            { name: "", symbol: "", address: this.resolveTokenAddress(), totalSupply: <Spinner size={12} /> }

        const processes = this.state.processes || []

        const upcomingProcesses = processes.filter(
            proc => this.state.blockNumber < proc.parameters.startBlock
        )
        const activeProcesses = processes.filter(
            proc => this.state.blockNumber >= proc.parameters.startBlock &&
                this.state.blockNumber < (proc.parameters.startBlock + proc.parameters.blockCount)
        )
        const endedProcesses = processes.filter(
            proc => this.state.blockNumber >= (proc.parameters.startBlock + proc.parameters.blockCount)
        )

        return <div id="token-info">
            <div className="page-head">
                <div className="left">
                    <h1>Token details</h1>
                    <h4 className="accent-1">See the details of {token.symbol}</h4>
                </div>
                <div className="right">
                    <WalletStatus />
                    <div>
                        <Button mode="strong" wide onClick={() => this.onCreateProcess(token.address)}>Create a governance process</Button>
                    </div>
                </div>
            </div>

            <div className="row-summary">
                <div className="item">
                    <p className="accent-1">Token symbol</p>
                    <h4>{token.symbol}</h4>
                </div>
                <div className="item">
                    <p className="accent-1">Token name</p>
                    <h4>{token.name}</h4>
                </div>
                <div className="item">
                    <p className="accent-1">Total supply</p>
                    <h4>{token && token.totalSupply}</h4>
                </div>
                <div className="item">
                    <p className="accent-1">Token address</p>
                    <h4 className="address">{token.address}</h4>
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
                        this.state.loading ? <Spinner /> :
                            activeProcesses.map((proc, idx) => <TokenCard name={token.symbol} icon={FALLBACK_TOKEN_ICON} rightText="" href={"/processes#/" + proc.id} key={idx}>
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
                        this.state.loading ? <Spinner /> :
                            endedProcesses.map((proc, idx) => <TokenCard name={token.symbol} icon={FALLBACK_TOKEN_ICON} rightText="" href={"/processes#/" + proc.id} key={idx}>
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
                        this.state.loading ? <Spinner /> :
                            upcomingProcesses.map((proc, idx) => <TokenCard name={token.symbol} icon={FALLBACK_TOKEN_ICON} rightText="" href={"/processes#/" + proc.id} key={idx}>
                                <p>{proc.metadata.title.default || "No title"}</p>
                            </TokenCard>)
                    }
                </div>
            </div>

        </div >
    }
}

export default TokenPage
