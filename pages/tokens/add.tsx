import { useState } from 'react'
import { CensusErc20Api } from 'dvote-js'
import Button from '../../components/button'
import Router from 'next/router'
import { WalletStatus } from '../../components/wallet-status'
import { usePool, useSigner } from '@vocdoni/react-hooks'
import { useWallet } from 'use-wallet'
import { getTokenInfo, hasBalance, registerToken } from '../../lib/api'
import Spinner from "react-svg-spinner"
import { NO_TOKEN_BALANCE, TOKEN_ALREADY_REGISTERED } from '../../lib/errors'
import { ACCENT_COLOR_2 } from '../../lib/constants'
import { TokenInfo } from '../../lib/types'

// MAIN COMPONENT
const TokenAddPage = props => {
    const wallet = useWallet()
    const signer = useSigner()
    const { poolPromise } = usePool()
    const [formTokenAddress, setFormTokenAddress] = useState<string>(null)
    const [tokenInfo, setTokenInfo] = useState<TokenInfo>(null)
    const [loadingToken, setLoadingToken] = useState(false)
    const [registeringToken, setRegisteringToken] = useState(false)

    // Callbacks

    const checkToken = () => {
        if (loadingToken) return
        else if (!formTokenAddress.match(/^0x[0-9a-fA-F]{40}$/)) {
            return alert("The token address is not valid")
        }

        setLoadingToken(true)

        poolPromise
            .then(pool => getTokenInfo(formTokenAddress, pool))
            .then(tokenInfo => {
                setLoadingToken(false)
                setTokenInfo(tokenInfo)
            }).catch(err => {
                setLoadingToken(false)
                alert("Could not fetch the contract details")
            })
    }

    const onSubmit = async () => {
        if (!tokenInfo) return
        else if (!wallet.connector || !wallet.account) return alert("Web3 support is not available")

        try {
            setRegisteringToken(true)
            const holderAddress = wallet.account
            const pool = await poolPromise

            const hasBal = await hasBalance(tokenInfo.address, holderAddress, pool)
            if (!hasBal) throw new Error(NO_TOKEN_BALANCE)
            else if (await CensusErc20Api.isRegistered(tokenInfo.address, pool)) {
                throw new Error(TOKEN_ALREADY_REGISTERED)
            }

            // Register
            await registerToken(tokenInfo.address, holderAddress, pool, signer)

            alert("The token has been successfully registered")
            setRegisteringToken(false)

            Router.push("/tokens/info#/" + tokenInfo.address)
        }
        catch (err) {
            setRegisteringToken(false)

            if (err && err.message == NO_TOKEN_BALANCE) return alert(NO_TOKEN_BALANCE)
            else if (err && err.message == TOKEN_ALREADY_REGISTERED) return alert(TOKEN_ALREADY_REGISTERED)

            alert("The token could not be registered")
        }
    }


    // RENDER

    return <div id="token-add">
        <div className="page-head">
            <div className="left">
                <h1>Register a Token</h1>
                <h4 className="accent-1">Enter the details of an ERC20 token and start submitting governance processes.</h4>
            </div>
            <div className="right">
                <WalletStatus />
            </div>
        </div>

        <div className="row-main">
            <div className="left">
                <h2>Token contract address</h2>
                <p className="light">Enter the address of the ERC20 contract that you want to register</p>
                <input type="text" placeholder="0x1234..." onKeyDown={ev => ev.key == "Enter" ? checkToken() : null} onChange={ev => setFormTokenAddress(ev.target.value)} />
            </div>
            <div className="right">
                {
                    loadingToken ?
                        <Button onClick={() => { }}><Spinner color={ACCENT_COLOR_2} /></Button> :
                        <Button onClick={() => checkToken()}>Check token</Button>
                }
            </div>
        </div>

        {
            tokenInfo && <>
                <div>
                    <h2>Token contract details</h2>
                    <p className="light">The following token will be registered. All token holders will be able to submit new governance processes.</p>
                </div>

                <div className="row-summary">
                    <div className="item">
                        <p className="accent-1">Token symbol</p>
                        <h4>{tokenInfo?.symbol}</h4>
                    </div>
                    <div className="item">
                        <p className="accent-1">Token name</p>
                        <h4>{tokenInfo?.name}</h4>
                    </div>
                    <div className="item">
                        <p className="accent-1">Total supply</p>
                        <h4>{tokenInfo?.totalSupply}</h4>
                    </div>
                    <div className="item">
                        <p className="accent-1">Token address</p>
                        <h4 className="address">{tokenInfo?.address}</h4>
                    </div>
                </div>

                <div className="row-continue">
                    {
                        !wallet.account ? <WalletStatus /> :
                            registeringToken ?
                                <Button onClick={() => { }}><Spinner color={ACCENT_COLOR_2} /></Button> :
                                <Button onClick={() => onSubmit()}>Register token</Button>
                    }
                </div>
            </>
        }

    </div>
}

export default TokenAddPage
