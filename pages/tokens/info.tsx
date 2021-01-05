import { useContext, Component } from 'react'
import { ProcessMetadata } from 'dvote-js'
// import { message, Button, Spin, Divider, Input, Select, Col, Row, Card, Modal } from 'antd'
// import { LoadingOutlined, ExclamationCircleOutlined } from '@ant-design/icons'
// import { getEntityId } from 'dvote-js/dist/api/entity'
// import Router from 'next/router'

// import { getGatewayClients, getNetworkState } from '../../../lib/network'
import { IWallet } from '../../lib/types'
import AppContext, { IAppContext } from '../../components/app-context'
import TokenCard from '../../components/token-card'
import Button from '../../components/button'
import Router from 'next/router'

// MAIN COMPONENT
const TokenPage = props => {
    // Get the global context and pass it to our stateful component
    const context = useContext(AppContext)

    return <TokenView {...context} />
}

type State = {
    entityLoading?: boolean,
}

// Stateful component
class TokenView extends Component<IAppContext, State> {
    state: State = {}

    onCreateProcess(tokenAddress: string) {
        Router.push("/processes/new#/" + tokenAddress)
    }

    render() {
        const token = { symbol: "DAI", address: "0x123412341234132698471629837461982736498213649817236498123412341234", name: "Multicollateral DAI", activeVotes: 7, marketCap: "$ 500M", icon: "https://cdn.worldvectorlogo.com/logos/dai-2.svg" }

        const activeProcesses: ProcessMetadata[] = [
            {
                title: { default: "Token supply expansion" },
                description: { default: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat." },
                questions: [
                    {
                        title: { default: "Do you approve a minting of 900.000 new MKR Tokens?" },
                        description: { default: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat." },
                        choices: [
                            { title: { default: "Approve the minting" }, value: 0 },
                            { title: { default: "Reject the minting" }, value: 1 },
                            { title: { default: "I may accept another amount" }, value: 2 },
                        ],
                    },
                    {
                        title: { default: "Do you approve a minting of 900.000 new MKR Tokens?" },
                        description: { default: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat." },
                        choices: [
                            { title: { default: "Approve the proposed minting" }, value: 0 },
                            { title: { default: "Approve up to 75% of the proposed amount" }, value: 1 },
                            { title: { default: "Approve up to 50% of the proposed amount" }, value: 2 },
                            { title: { default: "Approve up to 25% of the proposed amount" }, value: 3 },
                            { title: { default: "Reject the minting" }, value: 4 },
                        ],
                    },
                    {
                        title: { default: "Do you approve a minting of 900.000 new MKR Tokens?" },
                        description: { default: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat." },
                        choices: [
                            { title: { default: "Approve the minting" }, value: 0 },
                            { title: { default: "Reject the minting" }, value: 1 },
                        ],
                    }
                ],
                media: {
                    header: "",
                    streamUri: null
                },
                version: "1.1"
            }
        ]
        // TODO:
        activeProcesses.push(activeProcesses[0])
        activeProcesses.push(activeProcesses[0])
        activeProcesses.push(activeProcesses[0])

        const endedProcesses = activeProcesses

        return <div id="token-info">
            <div className="page-head">
                <div className="left">
                    <h1>Token details</h1>
                    <h4 className="accent-1">See the details of {token.symbol}</h4>
                </div>
                <div className="right">
                    <div className="v-center">Signed in as 0x1234... <img src="http://identicon.net/img/identicon.png" /></div>
                    <Button onClick={() => this.onCreateProcess(token.address)}>Create a governance process</Button>
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
                    <p className="accent-1">Market cap</p>
                    <h4>{token.marketCap}</h4>
                </div>
                <div className="item">
                    <p className="accent-1">Token address</p>
                    <h4 className="address">{token.address}</h4>
                </div>
            </div>

            <div className="row-main">
                <h2>Active votes</h2>
                <p className="accent-1">See the active governance processes and vote on them.</p>

                <div className="token-list">
                    {
                        activeProcesses.map((proc, idx) => <TokenCard name={token.symbol} icon="https://cdn.worldvectorlogo.com/logos/dai-2.svg" rightText="3 days left" href={"/processes#/" + idx} key={idx}>
                            <p>{proc.title.default}</p>
                        </TokenCard>)
                    }

                </div>
            </div>

            <div className="row-main">
                <h2>Vote results</h2>
                <p className="accent-1">See the results of the governance processes that already ended.</p>

                <div className="token-list">
                    {
                        endedProcesses.map((proc, idx) => <TokenCard name={token.symbol} icon="https://cdn.worldvectorlogo.com/logos/dai-2.svg" rightText="3 days left" href={"/processes#/" + idx} key={idx}>
                            <p>{proc.title.default}</p>
                        </TokenCard>)
                    }

                </div>
            </div>

        </div >
    }
}

export default TokenPage
