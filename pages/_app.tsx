import React, { useEffect } from "react";
import { AppProps } from "next/app";
import Head from "next/head";
import { Router } from "next/router";
import { UseSignerProvider } from "../lib/hooks/useSigner";
import {
  UseBlockStatusProvider,
  UsePoolProvider,
  UseProcessProvider,
} from "@vocdoni/react-hooks";
import { ThemeProvider } from "styled-components";

import { UseMessageAlertProvider } from "../lib/contexts/message-alert";
import { UseLoadingAlertProvider } from "../lib/contexts/loading-alert";
import {
  UseStoredTokensProvider,
  UseTokensWithBalance,
} from "../lib/contexts/tokens";
import { trackPage } from "../lib/analytics";
import { ModalsProvider } from "../lib/contexts/modal";
import { BUILD } from "../lib/constants/env";
import { useEnvironment } from "../lib/hooks/useEnvironment";

import { FixedGlobalStyle, theme } from "../theme";
import { Layout } from "../components/StructuralElements/layout";
import { CookiesBanner } from "../components/cookies-banner";
import {
  ApmProvider,
  instrumentApmRoutes,
  updateApmContext,
  useApm,
} from "../lib/contexts/apm";
import { IProviderOptions } from "web3modal";
import WalletConnectProvider from "@walletconnect/web3-provider";
import { MantineProvider } from "@mantine/core";
// import Fortmatic from "fortmatic";

// Web3Modal settings
const providerOptions: IProviderOptions = {
  // metamask: {}
  // walletconnect: {
  //   package: WalletConnectProvider,
  //   options: {
  //     infuraId: BUILD.walletConnectId,
  //   },
  // },
  // fortmatic: {
  //   package: Fortmatic, // required
  //   options: {
  //     key: BUILD.fortmaticKey,
  //     network: customNetworkOptions, // if we don't pass it, it will default to localhost:8454
  //   },
  // },
};

Router.events.on("routeChangeComplete", (url: string) => {
  trackPage(url);
});

const VoiceApp = ({ Component, router, pageProps }: AppProps) => {
  return (
    <ApmProvider>
      <ThemeProvider theme={theme}>
        <MantineProvider
          withGlobalStyles
          withNormalizeCSS
          theme={{ colorScheme: "light" }}
        >
          <UseMessageAlertProvider>
            <UseLoadingAlertProvider>
              <UseSignerProvider providerOptions={providerOptions}>
                <AppWithEnvironment
                  Component={Component}
                  router={router}
                  pageProps={pageProps}
                />
              </UseSignerProvider>
            </UseLoadingAlertProvider>
          </UseMessageAlertProvider>
        </MantineProvider>
      </ThemeProvider>
    </ApmProvider>
  );
};

const AppWithEnvironment = ({ Component, router, pageProps }: AppProps) => {
  const { networkName, bootnodesUrl, vocdoniEnvironment, archiveIpnsId } =
    useEnvironment();
  const { apm } = useApm();

  useEffect(() => {
    updateApmContext(apm, networkName);
  }, [apm, networkName]);

  Router.events.on("routeChangeStart", (url: string) => {
    instrumentApmRoutes(apm, url);
  });

  return (
    <UsePoolProvider
      bootnodeUri={bootnodesUrl}
      networkId={networkName}
      environment={vocdoniEnvironment}
      minNumGateways={1}
      discoveryTimeout={3500}
      archiveIpnsId={archiveIpnsId}
    >
      <UseBlockStatusProvider>
        <UseStoredTokensProvider>
          <UseProcessProvider>
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
          </UseProcessProvider>
        </UseStoredTokensProvider>
      </UseBlockStatusProvider>
    </UsePoolProvider>
  );
};

const HtmlHead = ({ appTitle }) => (
  <Head>
    <link rel="preconnect" href="https://fonts.gstatic.com" />
    <link
      href="https://fonts.googleapis.com/css2?family=Manrope:wght@200;300;400;500;600;700;800&display=swap"
      rel="stylesheet"
    />
    <link rel="preconnect" href="https://fonts.gstatic.com" />
    <link
      href="https://fonts.googleapis.com/css2?family=Overpass:ital,wght@0,100;0,200;0,300;0,400;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,600;1,700;1,800;1,900&display=swap"
      rel="stylesheet"
    />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>{appTitle}</title>
  </Head>
);

export default VoiceApp;
