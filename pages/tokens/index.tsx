import { useContext, Component } from 'react'
import Link from 'next/link'
import { API } from 'dvote-js'
// import { message, Button, Spin, Divider, Input, Select, Col, Row, Card, Modal } from 'antd'
// import { LoadingOutlined, ExclamationCircleOutlined } from '@ant-design/icons'
// import { getEntityId } from 'dvote-js/dist/api/entity'
// import Router from 'next/router'

// import { getGatewayClients, getNetworkState } from '../../lib/network'
import { IWallet } from '../../lib/types'
import AppContext, { IAppContext } from '../../components/app-context'
import TokenCard from '../../components/token-card'
import Select from 'react-select'

// MAIN COMPONENT
const TokensPage = props => {
    // Get the global context and pass it to our stateful component
    const context = useContext(AppContext)

    return <TokensView {...context} />
}

type State = {
    entityLoading?: boolean,
}

// Stateful component
class TokensView extends Component<IAppContext, State> {
    state: State = {}

    onTokenFilter(value: { value: string, label: string }, options: { action: string, option: any, name: any }) {
        console.log(value, options)
    }

    render() {
        const tokens = [
            { symbol: "MKR", address: "0x1234", name: "Maker DAO", activeVotes: 7, marketCap: "$ 90M", icon: "https://cdn.worldvectorlogo.com/logos/dai-2.svg" },
            { symbol: "ANT", address: "0x1234", name: "Aragon Token", activeVotes: 16, marketCap: "$ 900M", icon: "https://cdn.worldvectorlogo.com/logos/dai-2.svg" },
            { symbol: "DAI", address: "0x1234", name: "Multicollateral", activeVotes: 5, marketCap: "$ 40M", icon: "https://cdn.worldvectorlogo.com/logos/dai-2.svg" },
            { symbol: "ZRX", address: "0x1234", name: "0x District", activeVotes: 7, marketCap: "$ 900M", icon: "https://cdn.worldvectorlogo.com/logos/dai-2.svg" },
            { symbol: "MKR", address: "0x1234", name: "Maker DAO", activeVotes: 7, marketCap: "$ 90M", icon: "https://cdn.worldvectorlogo.com/logos/dai-2.svg" },
            { symbol: "ANT", address: "0x1234", name: "Aragon Token", activeVotes: 16, marketCap: "$ 900M", icon: "https://cdn.worldvectorlogo.com/logos/dai-2.svg" },
            { symbol: "DAI", address: "0x1234", name: "Multicollateral", activeVotes: 5, marketCap: "$ 40M", icon: "https://cdn.worldvectorlogo.com/logos/dai-2.svg" },
            { symbol: "ZRX", address: "0x1234", name: "0x District", activeVotes: 7, marketCap: "$ 900M", icon: "https://cdn.worldvectorlogo.com/logos/dai-2.svg" },
            { symbol: "MKR", address: "0x1234", name: "Maker DAO", activeVotes: 7, marketCap: "$ 90M", icon: "https://cdn.worldvectorlogo.com/logos/dai-2.svg" },
            { symbol: "ANT", address: "0x1234", name: "Aragon Token", activeVotes: 16, marketCap: "$ 900M", icon: "https://cdn.worldvectorlogo.com/logos/dai-2.svg" },
            { symbol: "DAI", address: "0x1234", name: "Multicollateral", activeVotes: 5, marketCap: "$ 40M", icon: "https://cdn.worldvectorlogo.com/logos/dai-2.svg" },
            { symbol: "ZRX", address: "0x1234", name: "0x District", activeVotes: 7, marketCap: "$ 900M", icon: "https://cdn.worldvectorlogo.com/logos/dai-2.svg" },
            { symbol: "MKR", address: "0x1234", name: "Maker DAO", activeVotes: 7, marketCap: "$ 90M", icon: "https://cdn.worldvectorlogo.com/logos/dai-2.svg" },
            { symbol: "ANT", address: "0x1234", name: "Aragon Token", activeVotes: 16, marketCap: "$ 900M", icon: "https://cdn.worldvectorlogo.com/logos/dai-2.svg" },
            { symbol: "DAI", address: "0x1234", name: "Multicollateral", activeVotes: 5, marketCap: "$ 40M", icon: "https://cdn.worldvectorlogo.com/logos/dai-2.svg" },
            { symbol: "ZRX", address: "0x1234", name: "0x District", activeVotes: 7, marketCap: "$ 900M", icon: "https://cdn.worldvectorlogo.com/logos/dai-2.svg" },
        ]
        const options = tokens.map(token => ({ value: token.symbol, label: token.name }))

        return <div id="tokens">
            <div className="page-head">
                <div className="left">
                    <h1>All Tokens</h1>
                    <h4 className="accent-1">Click at the tokens you own and cast your votes</h4>
                </div>
                <div className="right">
                    <Select options={options} onChange={(value, options) => this.onTokenFilter(value, options)} />
                    <h6 className="accent-1"><Link href="/tokens/add"><a>My token is not listed</a></Link></h6>
                </div>
            </div>

            <div className="row-main">
                <h2>Active votes</h2>
                <p className="light">Below are the processes belonging to tokens that you currently hold.</p>

                <div className="token-list">
                    {
                        tokens.map((token, idx) => <TokenCard name={token.symbol} icon={token.icon} rightText={token.marketCap} href={"/processes#/" + token.address} key={idx}>
                            <p>{token.name}<br />{token.activeVotes || 0} active votes</p>
                        </TokenCard>)
                    }

                </div>
            </div>

        </div>
    }
}

export default TokensPage
