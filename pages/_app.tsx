import React, { FC } from "react";
import { NextComponentType, NextPageContext } from "next";
import { AppInitialProps } from "next/app";
import Head from "next/head";
import { Router } from "next/router";
import { UseWalletProvider } from "use-wallet";
import { UsePoolProvider, UseProcessProvider } from "@vocdoni/react-hooks";
import { EthNetworkID, VocdoniEnvironment } from "dvote-js";
import { ThemeProvider } from "styled-components";

import { Layout } from "../components/layout";
import { UseMessageAlertProvider } from "../lib/hooks/message-alert";
import { UseLoadingAlertProvider } from "../lib/hooks/loading-alert";
import { UseRegisteredTokens, UseTokenProvider, UseUserTokens } from "../lib/hooks/tokens";

import { FixedGlobalStyle, theme } from "../theme";
import "react-datetime/css/react-datetime.css";
import { ModalsProvider } from "../components/Modal/context";
import { getConnectors } from "../lib/wallets";
import { SWRConfig } from "swr";

const swrOptions = {
  // refreshInterval: 5000,
};

type NextAppProps = AppInitialProps & {
  Component: NextComponentType<NextPageContext, any, any>;
  router: Router;
};

const BridgeApp: FC<NextAppProps> = ({ Component, pageProps }) => {
  const chainId = parseInt(process.env.ETH_CHAIN_ID);
  const bootnodeUri = process.env.BOOTNODES_URL;
  const networkId = process.env.ETH_NETWORK_ID as EthNetworkID;
  const environment = process.env.VOCDONI_ENVIRONMENT as VocdoniEnvironment;
  const appTitle = process.env.APP_TITLE;

  const connectors = getConnectors();

  return (
    <UseMessageAlertProvider>
      <SWRConfig value={swrOptions}>
        <ThemeProvider theme={theme}>
          <UseLoadingAlertProvider>
            <UsePoolProvider
              bootnodeUri={bootnodeUri}
              networkId={networkId}
              environment={environment}
            >
              <UseTokenProvider>
                <UseRegisteredTokens>
                  <UseProcessProvider>
                    <UseWalletProvider chainId={chainId} connectors={connectors || {}}>
                      <UseUserTokens>
                        <ModalsProvider>
                          <FixedGlobalStyle />

                          <Head>
                            <link rel="preconnect" href="https://fonts.gstatic.com"></link>
                            <link
                              href="https://fonts.googleapis.com/css2?family=Manrope:wght@200;300;400;500;600;700;800&display=swap"
                              rel="stylesheet"
                            ></link>
                            <link rel="preconnect" href="https://fonts.gstatic.com"></link>
                            <link
                              href="https://fonts.googleapis.com/css2?family=Overpass:ital,wght@0,100;0,200;0,300;0,400;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,600;1,700;1,800;1,900&display=swap"
                              rel="stylesheet"
                            />
                            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                            <title>{appTitle}</title>
                          </Head>
                          <Layout>
                            <Component {...pageProps} />
                          </Layout>
                        </ModalsProvider>
                      </UseUserTokens>
                    </UseWalletProvider>
                  </UseProcessProvider>
                </UseRegisteredTokens>
              </UseTokenProvider>
            </UsePoolProvider>
          </UseLoadingAlertProvider>
        </ThemeProvider>
      </SWRConfig>
    </UseMessageAlertProvider>
  );
};

export default BridgeApp;
