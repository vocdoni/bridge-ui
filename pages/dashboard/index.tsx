import { useContext, Component } from 'react'
import Link from 'next/link'
import { EntityApi } from 'dvote-js'
// import { message, Button, Spin, Divider, Input, Select, Col, Row, Card, Modal } from 'antd'
// import { LoadingOutlined, ExclamationCircleOutlined } from '@ant-design/icons'
// import { getEntityId } from 'dvote-js/dist/api/entity'
// import Router from 'next/router'

// import { getGatewayClients, getNetworkState } from '../../lib/network'
import AppContext, { IAppContext } from '../../lib/app-context'
import TokenCard from '../../components/token-card'
import Select from 'react-select'

// MAIN COMPONENT
const DashboardPage = props => {
    // Get the global context and pass it to our stateful component
    const context = useContext(AppContext)

    return <DashboardView {...context} />
}

type State = {
    entityLoading?: boolean,
}

// Stateful component
class DashboardView extends Component<IAppContext, State> {
    state: State = {}

    onTokenFilter(value: { value: string, label: string }, options: { action: string, option: any, name: any }) {
        console.log(value, options)
    }

    render() {
        const options = [
            { value: 'MKR', label: 'Maker DAO' },
            { value: 'DAI', label: 'DAI' },
            { value: 'ARZ', label: '0x District' },
            { value: 'ANT', label: 'Aragon Token' }
        ]

        return <div id="dashboard">
            <div className="page-head">
                <div className="left">
                    <h1>My Dashboard</h1>
                    <h4 className="accent-1">Vote on the open processes and see the results of the ones that already ended.</h4>
                </div>
                <div className="right">
                    <div className="v-center">Signed in as 0x1234... <img src="http://identicon.net/img/identicon.png" /></div>
                    <Select options={options} onChange={(value, options) => this.onTokenFilter(value, options)} />
                </div>
            </div>

            <div className="row-main">
                <h2>Active votes</h2>
                <p className="light">Below are the processes belonging to tokens that you currently hold.</p>

                <div className="token-list">
                    <TokenCard name="ZRX" icon="https://cdn.worldvectorlogo.com/logos/dai-2.svg" rightText="3 days left" href="/processes#/0x01234">
                        <p>Token supply expansion<br />Do you approve a minting of 900.000 new MKR Tokens?</p>
                    </TokenCard>

                    <TokenCard name="ZRX" icon="https://cdn.worldvectorlogo.com/logos/dai-2.svg" rightText="1 day left" href="/processes#/0x01234">
                        <p>Token supply expansion<br />Do you approve a minting of 900.000 new MKR Tokens?</p>
                    </TokenCard>

                    <TokenCard name="ZRX" icon="https://cdn.worldvectorlogo.com/logos/dai-2.svg" rightText="6h left" href="/processes#/0x01234">
                        <p>Token supply expansion<br />Do you approve a minting of 900.000 new MKR Tokens?</p>
                    </TokenCard>

                    <TokenCard name="ZRX" icon="https://cdn.worldvectorlogo.com/logos/dai-2.svg" rightText="1h left" href="/processes#/0x01234">
                        <p>Token supply expansion<br />Do you approve a minting of 900.000 new MKR Tokens?</p>
                    </TokenCard>
                </div>
            </div>

            <div className="row-main">
                <h2>Vote results</h2>
                <p className="light">Below are the results for votes related to your tokens.</p>

                <div className="token-list">
                    <TokenCard name="ZRX" icon="https://cdn.worldvectorlogo.com/logos/dai-2.svg" rightText="3 days ago" href="/processes#/0x01234">
                        <p>Token supply expansion<br />Do you approve a minting of 900.000 new MKR Tokens?</p>
                    </TokenCard>

                    <TokenCard name="ZRX" icon="https://cdn.worldvectorlogo.com/logos/dai-2.svg" rightText="1 day ago" href="/processes#/0x01234">
                        <p>Token supply expansion<br />Do you approve a minting of 900.000 new MKR Tokens?</p>
                    </TokenCard>

                    <TokenCard name="ZRX" icon="https://cdn.worldvectorlogo.com/logos/dai-2.svg" rightText="6h ago" href="/processes#/0x01234">
                        <p>Token supply expansion<br />Do you approve a minting of 900.000 new MKR Tokens?</p>
                    </TokenCard>

                    <TokenCard name="ZRX" icon="https://cdn.worldvectorlogo.com/logos/dai-2.svg" rightText="1h ago" href="/processes#/0x01234">
                        <p>Token supply expansion<br />Do you approve a minting of 900.000 new MKR Tokens?</p>
                    </TokenCard>
                </div>
            </div>

        </div>
    }
}

export default DashboardPage
