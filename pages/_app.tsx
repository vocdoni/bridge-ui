import React from "react";
import { NextComponentType, NextPageContext } from "next";
import { AppInitialProps } from "next/app";
import Head from "next/head";
import { Router } from "next/router";
import { UseWalletProvider } from "use-wallet";
import { UsePoolProvider, UseProcessProvider, UseBlockStatusProvider } from "@vocdoni/react-hooks";
import { ThemeProvider } from "styled-components";
import "react-datetime/css/react-datetime.css";

import { UseMessageAlertProvider } from "../lib/hooks/context/message-alert";
import { UseLoadingAlertProvider } from "../lib/hooks/context/loading-alert";
import { UseStoredTokensProvider, UseTokensWithBalance } from "../lib/hooks/context/tokens";
import { getConnectors } from "../lib/constants/wallets";
import { trackPage } from "../lib/analytics";

import { FixedGlobalStyle, theme } from "../theme";
import { Layout } from "../components/StructuralElements/layout";
import { ModalsProvider } from "../components/Modal/context";
import { CookiesBanner } from "../components/cookies-banner";
import { BUILD } from "../lib/constants/env";
import { useEnvironment, UseEnvironmentProvider } from "../lib/hooks/context/useEnvironment";

Router.events.on("routeChangeComplete", (url: string) => trackPage(url));

type NextAppProps = AppInitialProps & {
  Component: NextComponentType<NextPageContext, any, any>;
  router: Router;
};

const VoiceApp = ({ Component, router, pageProps }: NextAppProps) => {
  const connectors = getConnectors();
  // console.log("BUILT WITH " + JSON.stringify(BUILD, null, 2));
  return (
    <ThemeProvider theme={theme}>
      <UseMessageAlertProvider>
        <UseLoadingAlertProvider>
          <UseWalletProvider connectors={connectors || {}}>
            <UseEnvironmentProvider>
              <AppWithWallet Component={Component} router={router} pageProps={pageProps} />
            </UseEnvironmentProvider>
          </UseWalletProvider>
        </UseLoadingAlertProvider>
      </UseMessageAlertProvider>
    </ThemeProvider>
  );
};

const AppWithWallet = ({ Component, router, pageProps }: NextAppProps) => {
  const { networkName, bootnodesUrl, vocdoniEnvironment } = useEnvironment();
  console.log("rerender with " + networkName);

  return (
    <UsePoolProvider
      bootnodeUri={bootnodesUrl}
      networkId={networkName}
      environment={vocdoniEnvironment}
      minNumGateways={1}
      discoveryTimeout={2000}
    >
      <UseBlockStatusProvider>
        <UseStoredTokensProvider>
          {/* <UseProcessProvider> */}
          <UseTokensWithBalance>
            <ModalsProvider>
              <FixedGlobalStyle />
              <HtmlHead appTitle={BUILD.appTitle} />
              <Layout>
                <Component {...pageProps} />
              </Layout>
              <div id="commit-sha" style={{ display: "none" }}>
                {BUILD.commitSha}
              </div>
              <CookiesBanner />
            </ModalsProvider>
          </UseTokensWithBalance>
          {/* </UseProcessProvider> */}
        </UseStoredTokensProvider>
      </UseBlockStatusProvider>
    </UsePoolProvider>
  );
};

const HtmlHead = ({ appTitle }) => (
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
);

export default VoiceApp;
