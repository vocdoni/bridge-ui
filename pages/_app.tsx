import React, { FC } from 'react'
import { NextComponentType, NextPageContext } from 'next'
import { AppInitialProps } from 'next/app'
import Head from 'next/head'
import Header from '../components/header'
import Footer from '../components/footer'
import { Router } from 'next/router'
import { UseWalletProvider } from 'use-wallet'
import { UsePoolProvider } from '../lib/hooks/pool'
import { UseTokenProvider } from '../lib/hooks/tokens'

import '../styles/index.less'

type NextAppProps = AppInitialProps & { Component: NextComponentType<NextPageContext, any, any>; router: Router; }

const BridgeApp: FC<NextAppProps> = ({ Component, pageProps }) => {
    const chainId = parseInt(process.env.ETH_CHAIN_ID)

    return <UsePoolProvider>
        <UseTokenProvider>
            <UseWalletProvider chainId={chainId} connectors={{}}>
                <Head>
                    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                    <title>Bridge</title>
                </Head>
                <Header />
                <div id="main">
                    <Component {...pageProps} />
                </div>
                <Footer />
            </UseWalletProvider>
        </UseTokenProvider>
    </UsePoolProvider>
}

export default BridgeApp
