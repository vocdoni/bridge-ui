import React, { FC, useMemo } from 'react'
import { NextComponentType, NextPageContext } from 'next'
import { AppInitialProps } from 'next/app'
import Head from 'next/head'
import { Layout } from '../components/layout'
import { Router } from 'next/router'
import { UseWalletProvider } from 'use-wallet'
import { UsePoolProvider, UseProcessProvider } from '@vocdoni/react-hooks'
import { UseTokenProvider } from '../lib/hooks/tokens'
import { UseMessageAlertProvider } from '../lib/hooks/message-alert'
import { UseLoadingAlertProvider } from '../lib/hooks/loading-alert'
import { UseRegisteredTokens } from '../lib/hooks/registered-tokens'
import { EthNetworkID, VocdoniEnvironment } from 'dvote-js'

import '../styles/index.less'
import { ModalsProvider } from '../components/Modal/context'
import { getConnectors } from '../lib/wallets'

type NextAppProps = AppInitialProps & { Component: NextComponentType<NextPageContext, any, any>; router: Router; }

const BridgeApp: FC<NextAppProps> = ({ Component, pageProps }) => {
    const chainId = parseInt(process.env.ETH_CHAIN_ID)
    const bootnodeUri = process.env.BOOTNODES_URL
    const networkId = process.env.ETH_NETWORK_ID as EthNetworkID
    const environment = process.env.VOCDONI_ENVIRONMENT as VocdoniEnvironment
    const appTitle = process.env.APP_TITLE


    const connectors = getConnectors();

    return <UseMessageAlertProvider>
        <UseLoadingAlertProvider>
            <UsePoolProvider bootnodeUri={bootnodeUri} networkId={networkId} environment={environment}>
                <UseRegisteredTokens>
                    <UseTokenProvider>
                        <UseProcessProvider>
                            <UseWalletProvider chainId={4} connectors={connectors || {}}>
                                <ModalsProvider>
                                <Head>
                                    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                                    <title>{appTitle}</title>
                                </Head>
                                <Layout>
                                    <Component {...pageProps} />
                                </Layout>
                                </ModalsProvider>
                            </UseWalletProvider>
                        </UseProcessProvider>
                    </UseTokenProvider>
                </UseRegisteredTokens>
            </UsePoolProvider>
        </UseLoadingAlertProvider>
    </UseMessageAlertProvider>
}

export default BridgeApp
