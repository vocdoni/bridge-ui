export interface ConnectorData {
    name: string;
    connector: string;
    properties?: Record<string, string>;
}

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
        properties: { dAppId: "e83a1e82-0907-4aea-8d9e-f593a9bea43b" },
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
];

export const getConnectors = () => {
    const connectors = {};
    WALLETS.forEach(({ connector, properties }) => {
        connectors[connector] = properties || {};
    });
    return connectors;
};
