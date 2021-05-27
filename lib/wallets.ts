export interface ConnectorData {
  name: string;
  connector: string;
  properties?: Record<string, string | number>;
}

export type SUPPORTED_CONNECTORS =
  | "injected"
  | /* | "portis" */ "fortmatic" /* | "walletconnect" | "ledger" */;

// NOTE: This list of wallets is tentative. So far only Metamask and Fortmatic work
// consistently. HD wallets seem to cause problems, even when used through Metamask. The
// same is true for WalletConnect. They probably

export const WALLETS: ConnectorData[] = [
  {
    name: "Metamask",
    connector: "injected",
  },
  {
    name: "Fortmatic",
    connector: "fortmatic",
    properties: {
      apiKey: process.env.FORTMATIC_API_KEY,
    },
  },
  // {
  //   name: "Portis",
  //   connector: "portis",
  //   properties: { dAppId: "4402221a-b7c2-4781-9a0e-b1509dabaa1e" },
  // },
  // {
  //   name: "Wallet Connect",
  //   connector: "walletconnect",
  //   properties: {
  //     rpcUrl: `https://${process.env.ETH_NETWORK_ID}.infura.io/v3/b76cba91dc954ceebff27244923224b1`,
  //   },
  // },
  // {
  //   name: "Ledger",
  //   connector: "ledger",
  //   properties: {
  //     url: `https://${process.env.ETH_NETWORK_ID}.infura.io/v3/b76cba91dc954ceebff27244923224b1`,
  //     chainId: process.env.ETH_CHAIN_ID,
  //   },
  // },
  // TODO: Add Trezor support to the use-wallet repo and then connect it.
  // {
  //   name: "Trezor",
  //   connector: "trezor",
  // },
];

export const getConnectors = () => {
  const connectors = {};
  WALLETS.forEach(({ connector, properties }) => {
    connectors[connector] = properties || {};
  });
  return connectors;
};
