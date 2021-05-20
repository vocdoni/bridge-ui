export interface ConnectorData {
  name: string;
  connector: string;
  properties?: Record<string, string | number>;
}

export type SUPPORTED_CONNECTORS = "injected" | "portis" | "fortmatic" | "walletconnect" | "ledger";

// NOTE: This list of wallets is tentative. So far, only Metamask has been properly
// vetted. Portis and Fortmatic have been successfully tested on rinkeby-voice (Using
// firefox on desktop). Walletconnect could faild to connect on rinkeby-voice, reporting a
// "wrong chain error". Ledger has not been tested at all, so far. [VR 20-05-2021]

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
  // FIXME: Wallet connect seems unable to connect to testnets. [VR 20-05-2021]
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
