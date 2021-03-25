export interface ConnectorData {
    name: string;
    connector: string;
    properties?: Record<string, string | number>;
}

export type SUPPORTED_CONNECTORS =
    | "injected"
    | "authereum"
    | "portis"
    | "fortmatic"
    | "walletconnect";

export const WALLETS: ConnectorData[] = [
    {
        name: "Metamask",
        connector: "injected",
    },
    {
        name: "Authereum",
        connector: "authereum",
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
            apiKey: "pk_test_2A28633418BA689E",
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
            chainId: 1,
        },
    },
    {
        name: "Trezor",
        connector: "trezor",
    },
];

export const getConnectors = () => {
    const connectors = {};
    WALLETS.forEach(({ connector, ...properties }) => {
        connectors[connector] = properties || {};
    });
    return connectors;
};
