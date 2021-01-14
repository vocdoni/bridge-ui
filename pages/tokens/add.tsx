import { useContext, Component } from 'react'
import { CensusErc20Api, ProcessMetadata } from 'dvote-js'
// import { message, Button, Spin, Divider, Input, Select, Col, Row, Card, Modal } from 'antd'
// import { LoadingOutlined, ExclamationCircleOutlined } from '@ant-design/icons'
// import { getEntityId } from 'dvote-js/dist/api/entity'
// import Router from 'next/router'

// import { getGatewayClients, getNetworkState } from '../../../lib/network'
import AppContext, { IAppContext } from '../../lib/app-context'
import Button from '../../components/button'
import Router from 'next/router'
import { WalletStatus } from '../../components/wallet-status'
import { getTokenInfo, hasBalance, registerToken } from '../../lib/api'
import Spinner from "react-svg-spinner"
import { connectWeb3, getWeb3 } from '../../lib/web3'
import { NO_TOKEN_BALANCE, TOKEN_ALREADY_REGISTERED } from '../../lib/errors'
import { ACCENT_COLOR_2 } from '../../lib/constants'

// MAIN COMPONENT
const TokenAddPage = props => {
    // Get the global context and pass it to our stateful component
    const context = useContext(AppContext)

    return <TokenAddView {...context} />
}

type State = {
    loading?: boolean,
    registering?: boolean,
    tokenAddress: string,
    tokenInfo: {
        name: string;
        symbol: string;
        totalSupply: string;
        address: string;
    }
}

// Stateful component
class TokenAddView extends Component<IAppContext, State> {
    state: State = {
        tokenAddress: "",
        tokenInfo: null
    }

    onAddressChange(address: string) {
        this.setState({ tokenAddress: address })
    }

    checkToken() {
        if (this.state.loading) return
        if (!this.state.tokenAddress.match(/^0x[0-9a-fA-F]{40}$/)) {
            return alert("The token address is not valid")
        }

        this.setState({ loading: true })

        getTokenInfo(this.state.tokenAddress).then(infos => {
            this.setState({ loading: false, tokenInfo: infos })
        }).catch(err => {
            this.setState({ loading: false })
            alert("Could not fetch the contract details")
        })
    }

    async onSubmit() {
        if (!this.state.tokenInfo) return
        await connectWeb3()
        const { signer } = getWeb3()

        try {
            this.setState({ registering: true })
            const holderAddress = await signer.getAddress()

            const hasBal = await hasBalance(this.state.tokenInfo.address, holderAddress)
            if (!hasBal) throw new Error(NO_TOKEN_BALANCE)
            else if (await CensusErc20Api.isRegistered(this.state.tokenInfo.address, pool)) {
                throw new Error(TOKEN_ALREADY_REGISTERED)
            }

            // Register
            await registerToken(this.state.tokenInfo.address, holderAddress)

            alert("The token has been successfully registered")
            this.setState({ registering: false })

            Router.push("/tokens#/" + this.state.tokenInfo.address)
        }
        catch (err) {
            this.setState({ registering: false })

            if (err && err.message == NO_TOKEN_BALANCE) return alert(NO_TOKEN_BALANCE)
            else if (err && err.message == TOKEN_ALREADY_REGISTERED) return alert(TOKEN_ALREADY_REGISTERED)

            alert("The token could not be registered")
        }
    }

    render() {
        const { holderAddress } = this.props

        return <div id="token-add">
            <div className="page-head">
                <div className="left">
                    <h1>Register a Token</h1>
                    <h4 className="accent-1">Enter the details of an ERC20 token and start submitting governance processes.</h4>
                </div>
                <div className="right">
                    <WalletStatus address={holderAddress} />
                </div>
            </div>

            <div className="row-main">
                <div className="left">
                    <h2>Token contract address</h2>
                    <p className="light">Enter the address of the ERC20 contract that you want to register</p>
                    <input type="text" placeholder="0x1234..." onKeyDown={ev => ev.key == "Enter" ? this.checkToken() : null} onChange={ev => this.onAddressChange(ev.target.value)} />
                </div>
                <div className="right">
                    {
                        this.state.loading ?
                            <Button onClick={() => { }}><Spinner color={ACCENT_COLOR_2} /></Button> :
                            <Button onClick={() => this.checkToken()}>Check token</Button>
                    }
                </div>
            </div>

            {
                this.state.tokenInfo && <>
                    <div>
                        <h2>Token contract details</h2>
                        <p className="light">The following token will be registered. All token holders will be able to submit new governance processes.</p>
                    </div>

                    <div className="row-summary">
                        <div className="item">
                            <p className="accent-1">Token symbol</p>
                            <h4>{this.state.tokenInfo.symbol}</h4>
                        </div>
                        <div className="item">
                            <p className="accent-1">Token name</p>
                            <h4>{this.state.tokenInfo.name}</h4>
                        </div>
                        <div className="item">
                            <p className="accent-1">Total supply</p>
                            <h4>{this.state.tokenInfo.totalSupply}</h4>
                        </div>
                        <div className="item">
                            <p className="accent-1">Token address</p>
                            <h4 className="address">{this.state.tokenInfo.address}</h4>
                        </div>
                    </div>

                    <div className="row-continue">
                        {this.state.registering ?
                            <Button onClick={() => { }}><Spinner color={ACCENT_COLOR_2} /></Button> :
                            <Button onClick={() => this.onSubmit()}>Register token</Button>
                        }
                    </div>
                </>
            }

        </div>
    }
}

export default TokenAddPage
