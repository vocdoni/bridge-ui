import { useContext, Component } from 'react'
import Link from 'next/link'
import { } from 'dvote-js'
// import { message, Button, Spin, Divider, Input, Select, Col, Row, Card, Modal } from 'antd'
// import { LoadingOutlined, ExclamationCircleOutlined } from '@ant-design/icons'
// import { getEntityId } from 'dvote-js/dist/api/entity'
// import Router from 'next/router'

// import { getGatewayClients, getNetworkState } from '../../lib/network'
import AppContext, { IAppContext } from '../../lib/app-context'
import TokenCard from '../../components/token-card'
import Select from 'react-select'
import { WalletStatus } from '../../components/wallet-status'
import { allTokens } from '../../lib/tokens'
import { getTokenInfo } from '../../lib/api'

const FALLBACK_TOKEN_ICON = "https://cdn.worldvectorlogo.com/logos/dai-2.svg"

// MAIN COMPONENT
const TokensPage = props => {
    // Get the global context and pass it to our stateful component
    const context = useContext(AppContext)

    return <TokensView {...context} />
}

type State = {
    loding?: boolean,
    tokens: { name: string, symbol: string, address: string, totalSupply: string }[],
    filter: string
}

// Stateful component
class TokensView extends Component<IAppContext, State> {
    state: State = {
        tokens: null,
        filter: null
    }

    componentDidMount() {
        Promise.all(allTokens.map(token => {
            return getTokenInfo(token.address)
        })).then(infos => {
            this.setState({ tokens: infos })
        })
    }

    onTokenFilter(selection: { value: string, label: string }, options: { action: string, option: any, name: any }) {
        this.setState({ filter: selection.value })
    }

    render() {
        const { holderAddress } = this.props
        let tokens = this.state.tokens ?
            this.state.tokens :
            allTokens.map(t => ({ name: t.name, symbol: t.symbol, address: t.address, totalSupply: "" }))

        if (this.state.filter) {
            tokens = [tokens.find(t => t.symbol == this.state.filter)]
        }

        let options = tokens.map(token => ({ value: token.symbol, label: token.name }))
        options.unshift({ value: "", label: "(All tokens)" })

        return <div id="tokens">
            <div className="page-head">
                <div className="left">
                    <h1>All Tokens</h1>
                    <h4 className="accent-1">Click at the tokens you own and cast your votes</h4>
                </div>
                <div className="right">
                    <WalletStatus />

                    <Select options={options} onChange={(value, options) => this.onTokenFilter(value, options)} />
                    <h6 className="accent-1"><Link href="/tokens/add"><a>My token is not listed</a></Link></h6>
                </div>
            </div>

            <div className="row-main">
                <h2>Active tokens</h2>
                <p className="light">Below are the processes belonging to tokens that you currently hold.</p>

                <div className="token-list">
                    {
                        tokens.map((token, idx) => <TokenCard name={token.symbol} icon={FALLBACK_TOKEN_ICON} rightText={""} href={"/tokens/info#/" + token.address} key={idx}>
                            <p>{token.name}<br />
                                {token.totalSupply ?
                                    <small>Total supply: {token.totalSupply}</small> :
                                    null
                                }
                            </p>
                        </TokenCard>)
                    }

                </div>
            </div>

        </div>
    }
}

export default TokensPage
