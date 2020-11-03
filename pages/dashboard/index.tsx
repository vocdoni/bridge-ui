import { useContext, Component } from 'react'
import Link from 'next/link'
import { API, EntityMetadata } from 'dvote-js'
// import { message, Button, Spin, Divider, Input, Select, Col, Row, Card, Modal } from 'antd'
// import { LoadingOutlined, ExclamationCircleOutlined } from '@ant-design/icons'
// import { getEntityId } from 'dvote-js/dist/api/entity'
// import Router from 'next/router'

// import { getGatewayClients, getNetworkState } from '../../lib/network'
import { IWallet } from '../../lib/types'
import AppContext, { IAppContext } from '../../components/app-context'
import Button from '../../components/button'
import TokenCard from '../../components/token-card'

const { Entity } = API

// MAIN COMPONENT
const IndexPage = props => {
    // Get the global context and pass it to our stateful component
    const context = useContext(AppContext)

    return <IndexView {...context} />
}

type State = {
    entityLoading?: boolean,
}

// Stateful component
class IndexView extends Component<IAppContext, State> {
    state: State = {}

    onMetamaskSignIn() {
        console.log("METAMASK")
    }

    onTokenClick() {
        console.log("TOKEN")
    }

    render() {
        return <div id="dashboard">
            <div className="title">
                <div className="left">
                    <h1>My Dashboard</h1>
                    <h4 className="accent-1">Vote on the open processes and see the results of the ones that already ended.</h4>
                </div>
                <div className="right">
                    <div className="v-center">Signed in as 0x1234... <img src="http://identicon.net/img/identicon.png" /></div>
                </div>
            </div>

            <div className="row-main">
                <h2>Active votes</h2>
                <p className="light">Below are the processes belonging to tokens that you currently hold.</p>

                <div className="token-list">
                    <TokenCard name="ZRX" icon="https://cdn.worldvectorlogo.com/logos/dai-2.svg" rightText="3 days left" onClick={() => this.onTokenClick()}>
                        <p>Token supply expansion<br/>Do you approve a minting of 900.000 new MKR Tokens?</p>
                    </TokenCard>

                    <TokenCard name="ZRX" icon="https://cdn.worldvectorlogo.com/logos/dai-2.svg" rightText="1 day left" onClick={() => this.onTokenClick()}>
                        <p>Token supply expansion<br/>Do you approve a minting of 900.000 new MKR Tokens?</p>
                    </TokenCard>

                    <TokenCard name="ZRX" icon="https://cdn.worldvectorlogo.com/logos/dai-2.svg" rightText="6h left" onClick={() => this.onTokenClick()}>
                        <p>Token supply expansion<br/>Do you approve a minting of 900.000 new MKR Tokens?</p>
                    </TokenCard>

                    <TokenCard name="ZRX" icon="https://cdn.worldvectorlogo.com/logos/dai-2.svg" rightText="1h left" onClick={() => this.onTokenClick()}>
                        <p>Token supply expansion<br/>Do you approve a minting of 900.000 new MKR Tokens?</p>
                    </TokenCard>
                </div>
            </div>

            <div className="row-main">
                <h2>Vote results</h2>
                <p className="light">Below are the results for votes related to your tokens.</p>

                <div className="token-list">
                    <TokenCard name="ZRX" icon="https://cdn.worldvectorlogo.com/logos/dai-2.svg" rightText="3 days ago" onClick={() => this.onTokenClick()}>
                        <p>Token supply expansion<br/>Do you approve a minting of 900.000 new MKR Tokens?</p>
                    </TokenCard>

                    <TokenCard name="ZRX" icon="https://cdn.worldvectorlogo.com/logos/dai-2.svg" rightText="1 day ago" onClick={() => this.onTokenClick()}>
                        <p>Token supply expansion<br/>Do you approve a minting of 900.000 new MKR Tokens?</p>
                    </TokenCard>

                    <TokenCard name="ZRX" icon="https://cdn.worldvectorlogo.com/logos/dai-2.svg" rightText="6h ago" onClick={() => this.onTokenClick()}>
                        <p>Token supply expansion<br/>Do you approve a minting of 900.000 new MKR Tokens?</p>
                    </TokenCard>

                    <TokenCard name="ZRX" icon="https://cdn.worldvectorlogo.com/logos/dai-2.svg" rightText="1h ago" onClick={() => this.onTokenClick()}>
                        <p>Token supply expansion<br/>Do you approve a minting of 900.000 new MKR Tokens?</p>
                    </TokenCard>
                </div>
            </div>

        </div>
    }
}

export default IndexPage
