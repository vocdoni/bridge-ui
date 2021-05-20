export interface ConnectorData {
  name: string;
  connector: string;
  properties?: Record<string, string | number>;
}

export type SUPPORTED_CONNECTORS = "injected" | "portis" | "fortmatic" | "walletconnect";

export const WALLETS: ConnectorData[] = [
  {
    name: "Metamask",
    connector: "injected",
  },
  {
    name: "Portis",
    connector: "portis",
    properties: { dAppId: "4402221a-b7c2-4781-9a0e-b1509dabaa1e" },
  },
  {
    name: "Fortmatic",
    connector: "fortmatic",
    properties: {
      apiKey: process.env.FORTMATIC_API_KEY,
    },
  },
  {
    name: "Wallet Connect",
    connector: "walletconnect",
    properties: {
      rpcUrl: `https://${process.env.ETH_NETWORK_ID}.infura.io/v3/b76cba91dc954ceebff27244923224b1`,
    },
  },
  {
    name: "Ledger",
    connector: "ledger",
    properties: {
      url: `https://${process.env.ETH_NETWORK_ID}.infura.io/v3/b76cba91dc954ceebff27244923224b1`,
      chainId: process.env.ETH_CHAIN_ID,
    },
  },
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
