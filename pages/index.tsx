import { useContext, Component } from 'react'
// import Link from 'next/link'
import Router from 'next/router'
import { EntityApi, EntityMetadata } from 'dvote-js'
// import { message, Button, Spin, Divider, Input, Select, Col, Row, Card, Modal } from 'antd'
// import { LoadingOutlined, ExclamationCircleOutlined } from '@ant-design/icons'
// import { getEntityId } from 'dvote-js/dist/api/entity'
// import Router from 'next/router'

// import { getGatewayClients, getNetworkState } from '../lib/network'
import AppContext, { IAppContext } from '../lib/app-context'
import Button from '../components/button'
import TokenCard from '../components/token-card'
import { connectWeb3, isWeb3Ready } from '../lib/web3'
import { connectVochain, getPool } from '../lib/vochain'
import Spinner from "react-svg-spinner"
import { allTokens } from '../lib/tokens'

import { INVALID_CHAIN_ID, METAMASK_IS_NOT_AVAILABLE } from '../lib/errors'
import { getTokenInfo } from '../lib/api'

// MAIN COMPONENT
const IndexPage = props => {
    // Get the global context and pass it to our stateful component
    const context = useContext(AppContext)

    return <IndexView {...context} />
}

type State = {
    connecting: boolean,
    tokens: { name: string, symbol: string, address: string, totalSupply: string }[],
}

// Stateful component
class IndexView extends Component<IAppContext, State> {
    state: State = {
        connecting: false,
        tokens: []
    }

    componentDidMount() {
        Promise.all(allTokens.map(token => {
            return getTokenInfo(token.address)
        })).then(infos => {
            this.setState({ tokens: infos })
        })
    }

    onMetamaskSignIn() {
        const pool = getPool()
        if (isWeb3Ready() && pool) { // && pool.isReady) {
            return Router.push("/dashboard")
        }

        this.setState({ connecting: true })

        return connectWeb3()
            .then(() => connectVochain())
            .then(() => Router.push("/dashboard"))
            .catch(err => {
                this.setState({ connecting: false })

                if (err && err.message == INVALID_CHAIN_ID) {
                    const msg = "Please, switch to the {{NAME}} network".replace("{{NAME}}", process.env.ETH_NETWORK_ID)
                    return alert(msg)
                }
                else if (err && err.message == METAMASK_IS_NOT_AVAILABLE) {
                    return alert("Please, install Metamask or a Web3 compatible wallet")
                }
                console.error(err)
                alert("Could not access Metamask or connect to the network")
            })
    }

    onTokenClick(address: string) {
        Router.push("/tokens#/" + address)
    }

    render() {
        const pool = getPool()
        const isConnected = isWeb3Ready() && pool // && pool.isReady

        return <div id="index">
            <div className="page-head">
                <h1>Bridge</h1>
                <h4 className="accent-1">Trustless governance for Token holders</h4>
            </div>

            <div className="row-1">
                <div className="left">
                    <h4>Submit proposals for <span className="accent-1">ERC20</span> tokens and vote on them using a decentralized end-to-end verifiable <span className="accent-1">layer 2</span> blockchain.</h4>
                    {/* <p className="light">Lorem ipsum dolor sit amen. Lorem ipsum dolor sit amen. </p> */}
                    <p><small>
                        <a href="https://ethereum.org/en/developers/docs/standards/tokens/erc-20/" className="accent-1" target="_blank">
                            What is an ERC20 Token?
                        </a>
                    </small></p>
                </div>
                <div className="right">
                    {
                        this.state.connecting ? <Spinner /> :
                            <Button onClick={() => this.onMetamaskSignIn()}>{
                                isConnected ? "Connected" : "Sign in with Metamask"
                            }</Button>
                    }
                </div>
            </div>

            <br /><br />

            <div className="row-2">
                <div className="left">
                    <div style={{ backgroundColor: "#ccc", borderRadius: "50%", height: 140, width: 140 }}></div>
                </div>
                <div className="right">
                    <h2>Speak up</h2>
                    <h4>Find your token on the list and vote on the decisions that will make it grow. Be the first one to register it if it doesn’t exist and create your first proposal.</h4>
                    <p><small>
                        <a href="https://www.notion.so/Introducing-Vocdoni-Bridge-cf7e73d38c4a45788358e9a1497cdf19#0481a4a6fd5b4f5c90bb67784f2a86ba" className="accent-1" target="_blank">
                            Learn more
                        </a>
                    </small></p>
                </div>
            </div>

            <br /><br />

            <div className="row-3">
                <h2>Top Tokens</h2>
                <p className="light">Below is a curated list of tokens featured on the platform</p>

                <div className="token-list">
                    {
                        this.state.tokens.map(token => <TokenCard key={token.address} name={token.symbol} icon="https://cdn.worldvectorlogo.com/logos/dai-2.svg" rightText="" href={"/tokens/info#/" + token.address}>
                            <p>{token.name}</p>
                        </TokenCard>)
                    }
                </div>
            </div>

            <br /><br />

            <div className="row-4">
                <Button href="/tokens">Show more</Button>
            </div>

        </div>
    }
}

export default IndexPage
