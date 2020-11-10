import { useContext, Component } from 'react'
import { API, ProcessMetadata } from 'dvote-js'
// import { message, Button, Spin, Divider, Input, Select, Col, Row, Card, Modal } from 'antd'
// import { LoadingOutlined, ExclamationCircleOutlined } from '@ant-design/icons'
// import { getEntityId } from 'dvote-js/dist/api/entity'
// import Router from 'next/router'

// import { getGatewayClients, getNetworkState } from '../../../lib/network'
import { IWallet } from '../../lib/types'
import AppContext, { IAppContext } from '../../components/app-context'
import Button from '../../components/button'
import Router from 'next/router'

// MAIN COMPONENT
const TokenAddPage = props => {
    // Get the global context and pass it to our stateful component
    const context = useContext(AppContext)

    return <TokenAddView {...context} />
}

type State = {
    entityLoading?: boolean,
}

// Stateful component
class TokenAddView extends Component<IAppContext, State> {
    state: State = {}

    onAddressChange(address: string) {
        console.log(address)
    }

    checkToken() {
        alert("CHECK")
    }

    onSubmit() {
        alert("GO")
    }

    render() {
        const token = { symbol: "DAI", address: "0x123412341234132698471629837461982736498213649817236498123412341234", name: "Multicollateral DAI", activeVotes: 7, marketCap: "$ 500M", icon: "https://cdn.worldvectorlogo.com/logos/dai-2.svg" }

        return <div id="token-add">
            <div className="page-head">
                <div className="left">
                    <h1>Register a Token</h1>
                    <h4 className="accent-1">Enter the details of an ERC20 token and start submitting governance processes.</h4>
                </div>
                <div className="right">
                    <div className="v-center">Signed in as 0x1234... <img src="http://identicon.net/img/identicon.png" /></div>
                </div>
            </div>

            <div className="row-main">
                <div className="left">
                    <h2>Token contract address</h2>
                    <p className="light">Enter the address of the ERC20 contract that you want to register</p>
                    <input type="text" placeholder="0x1234..." onChange={ev => this.onAddressChange(ev.target.value)} />
                </div>
                <div className="right">
                    <Button onClick={() => this.checkToken()}>Check token</Button>
                </div>
            </div>

            <div>
                <h2>Vote results</h2>
                <p className="light">The following token will be registered. All token holders will be able to submit new governance processes.</p>
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

            <div className="row-continue">
                <Button onClick={() => this.onSubmit()}>Register token</Button>
            </div>

        </div>
    }
}

export default TokenAddPage
