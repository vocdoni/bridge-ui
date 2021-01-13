import React, { FC, useState, useEffect } from 'react'
import Head from 'next/head'
import App, { AppInitialProps } from 'next/app'

import AppContext, { IAppContext } from '../lib/app-context'
// import MainLayout from '../components/layout'
// import GeneralError from '../components/error'
// import { initNetwork, getNetworkState } from '../lib/network'
// import { IAppContext } from '../components/app-context'
// import { isServer } from '../lib/util'

import '../styles/index.less'
import Header from '../components/header'
import Footer from '../components/footer'
import { getWeb3 } from '../lib/web3'
import { getPool } from '../lib/vochain'
import { NextComponentType, NextPageContext } from 'next'
import { Router } from 'next/router'
// import IndexPage from '.'

type NextAppProps = AppInitialProps & { Component: NextComponentType<NextPageContext, any, State>; router: Router; }

const BridgeApp: FC<NextAppProps> = ({ Component, pageProps }) => {
    const [entityId, setEntityId] = useState("")
    const [processId, setProcessId] = useState("")
    const [urlHash, setUrlHash] = useState("")

    const onHashChanged = (e: HashChangeEvent) => {
        if (urlHash == location.hash.substr(2)) return

        console.log("NEW URL HASH", location.hash.substr(2))
        setUrlHash(location.hash.substr(2))
    }

    useEffect(() => {
        // this.connect()
        window.addEventListener('hashchange', onHashChanged)
        // window.addEventListener('popstate', onHashChanged)
        // Router.events.on('routeChangeStart', onHashChanged)

        return () => {
            window.removeEventListener('hashchange', onHashChanged)
            // window.removeEventListener('popstate', onHashChanged)
            // Router.events.off('routeChangeStart', onHashChanged)
        }
    })

    // Get data from getInitialProps and provide it as the global context to children
    const { provider, signer, holderAddress } = getWeb3()
    const pool = getPool()

    const injectedGlobalContext: IAppContext = {
        provider,
        signer,
        holderAddress,
        pool,

        // State
        setEntityId: value => setEntityId(value),
        setProcessId: value => setProcessId(value),
        setUrlHash: value => setUrlHash(value),
        entityId: entityId,
        processId: processId,
        urlHash: urlHash,
    }

    return <AppContext.Provider value={injectedGlobalContext}>
        <Head>
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <title>Bridge</title>
        </Head>
        <Header />
        <div id="main">
            <Component {...pageProps} />
        </div>
        <Footer />
    </AppContext.Provider>
}

export default BridgeApp
