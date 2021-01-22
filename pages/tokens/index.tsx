import { useContext, Component, useState, useEffect } from 'react'
import Link from 'next/link'
import { VotingApi } from 'dvote-js'

import TokenCard from '../../components/token-card'
// import Select from 'react-select'
import { WalletStatus } from '../../components/wallet-status'
import { allTokens } from '../../lib/tokens'
import { usePool } from '../../lib/hooks/pool'
import { useTokens } from '../../lib/hooks/tokens'
import { FALLBACK_TOKEN_ICON } from '../../lib/constants'


// MAIN COMPONENT
const TokensPage = props => {
    const { pool, resolvePool } = usePool()
    const [blockNumber, setBlockNumber] = useState(0)
    const [targetTokenAddress, setTargetTokenAddress] = useState(null as string)

    const tokenAddrs = targetTokenAddress ? [targetTokenAddress] : allTokens
    const tokenInfos = useTokens(tokenAddrs)

    // Block update
    useEffect(() => {
        if (!resolvePool) return

        const updateBlockHeight = () => {
            resolvePool
                .then(pool => VotingApi.getBlockHeight(pool))
                .then(num => setBlockNumber(num))
                .catch(err => console.error(err))
        }

        const interval = setInterval(() => updateBlockHeight, 1000 * 15)
        updateBlockHeight()

        // Done
        return () => clearInterval(interval)
    }, [pool])

    return <div id="tokens">
        <div className="page-head">
            <div className="left">
                <h1>All Tokens</h1>
                <h4 className="accent-1">Click at the tokens you own and cast your votes</h4>
            </div>
            <div className="right">
                <WalletStatus />

                {/* <Select options={options} onChange={(value, options) => this.onTokenFilter(value, options)} /> */}
                <h6 className="accent-1"><Link href="/tokens/add"><a>My token is not listed</a></Link></h6>
            </div>
        </div>

        <div className="row-main">
            <h2>Active tokens</h2>
            <p className="light">Below are the processes belonging to tokens that you currently hold.</p>

            <div className="token-list">
                {
                    tokenAddrs.map(addr => tokenInfos.get(addr)).map((token, idx) => <TokenCard name={token?.symbol} icon={token?.icon || FALLBACK_TOKEN_ICON} rightText={""} href={"/tokens/info#/" + token?.address} key={idx}>
                        <p>
                            {token?.name || "(loading)"}<br />
                            {token?.totalSupply && <small>Total supply: {token?.totalSupply}</small>}
                        </p>
                    </TokenCard>)
                }

            </div>
        </div>

    </div>
}

export default TokensPage
