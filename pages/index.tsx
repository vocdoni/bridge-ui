import { useState } from 'react'
// import Link from 'next/link'
import { withRouter, useRouter } from 'next/router'
import TokenCard from '../components/token-card'
import { featuredTokens } from '../lib/tokens'
import { Button, IconEthereum, LoadingRing } from '@aragon/ui'
// import Spinner from "react-svg-spinner"
import { ChainUnsupportedError, useWallet } from 'use-wallet'

import { INVALID_CHAIN_ID, METAMASK_IS_NOT_AVAILABLE } from '../lib/errors'
import { usePool } from '@vocdoni/react-hooks'
import { useTokens } from '../lib/hooks/tokens'
import { FALLBACK_TOKEN_ICON } from '../lib/constants'
import { useMessageAlert } from '../lib/hooks/message-alert'

// MAIN COMPONENT
const IndexPage = () => {
    const { setAlertMessage } = useMessageAlert()
    const [connecting, setConnecting] = useState(false)
    const router = useRouter()
    const { pool, loading: poolLoading, error: poolError, refresh: poolRefresh } = usePool()
    const wallet = useWallet()
    const tokenInfos = useTokens(featuredTokens)

    const isConnected = wallet.status == "connected"

    // CALLBACKS

    function onSignIn() {
        if (pool && wallet.status == "connected") {
            return router.push("/dashboard")
        }

        setConnecting(true)

        return wallet.connect("injected")
            .then(() => {
                if (!wallet.connectors.injected) throw new Error(METAMASK_IS_NOT_AVAILABLE)
                router.push("/dashboard")
            })
            .catch(err => {
                setConnecting(false)

                if (err && err.message == INVALID_CHAIN_ID || err instanceof ChainUnsupportedError) {
                    const msg = "Please, switch to the {{NAME}} network".replace("{{NAME}}", process.env.ETH_NETWORK_ID)
                    return setAlertMessage(msg)
                }
                else if (err && err.message == METAMASK_IS_NOT_AVAILABLE) {
                    return setAlertMessage("Please, install Metamask or a Web3 compatible wallet")
                }
                console.error(err)
                setAlertMessage("Could not access Metamask or connect to the network")
            })
    }


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
                {(() => {
                    if (poolLoading) {
                        return <Button label={"Connecting to Vocdoni"} icon={<LoadingRing />} wide onClick={() => wallet.reset()} />
                    }
                    else if (connecting) {
                        return <Button label={"Connecting to " + wallet.networkName} icon={<LoadingRing />} wide onClick={() => wallet.reset()} />
                    }

                    return <Button
                        label={isConnected ? "Show dashboard" : "Connect with MetaMask"}
                        icon={<IconEthereum />} mode="strong"
                        wide onClick={() => onSignIn()} />
                })()}
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
                    featuredTokens.map(tokenAddr => <TokenCard key={tokenAddr} name={tokenInfos.get(tokenAddr)?.symbol} icon={FALLBACK_TOKEN_ICON} rightText="" href={tokenAddr ? ("/tokens/info#/" + tokenAddr) : ""}>
                        <p>{tokenInfos.get(tokenAddr)?.name || "(loading)"}</p>
                    </TokenCard>)
                }
            </div>
        </div>

        <br /><br />

        <div className="row-4">
            <Button href="/tokens">Show more</Button>
        </div>

    </div >
}

export default withRouter(IndexPage)
