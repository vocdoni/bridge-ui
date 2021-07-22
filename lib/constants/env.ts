export const ETH_BLOCK_HEIGHT_PADDING = 10;
export const GOERLI_MULTICALL = "0x77dca2c955b15e9de4dbbcf1246b4b85b651e50e";
export const EMPTY_ADDRESS = "0x0000000000000000000000000000000000000000";

interface BuildVariables {
  development: string;
  isDevelopment: boolean;
  vocdoniEnvironment: string;
  commitSha: string;
  appTitle: string;
  analyticsKey: string;
  fortmaticKey: string;
}

/*  Maybe have singleton objects with fields derived from env directly */
export const BUILD: BuildVariables = {
  isDevelopment: process.env.DEVELOPMENT,
  vocdoniEnvironment: "dev",
  // vocdoniEnv: process.env.VOCDONI_ENVIRONMENT,
  commitSha: process.env.COMMIT_SHA,
  appTitle: process.env.APP_TITLE,
  analyticsKey: process.env.ANALYTICS_KEY,
  fortmaticKey: process.env.FORTMATIC_API_KEY,
};

interface NetworkVariables {
  chainId: number;
  networkName: string;
  etherscanPrefix: string;
  blockTime: number;
  bootnodesUrl: string;
  singalingOracleUrl: string;
}

const ENVIRONMENTS: NetworkVariables[] = [
  {
    chainId: 1,
    networkName: "mainnet",
    etherscanPrefix: "https://etherscan.io",
    blockTime: 10,
    bootnodesUrl: "https://bootnodes.vocdoni.net/gateways.json",
    singalingOracleUrl: "https://signaling-oracle.vocdoni.net/dvote",
  },
  {
    chainId: 4,
    networkName: "rinkeby",
    etherscanPrefix: "https://rinkeby.etherscan.io",
    blockTime: 12,
    bootnodesUrl: "https://bootnodes.vocdoni.net/gateways.dev.json",
    singalingOracleUrl: "https://signaling-oracle.dev.vocdoni.net/dvote",
  },
];

export function getNetworkVars(chainId: number = 1): NetworkVariables {
  console.log(chainId);
  return ENVIRONMENTS.find((env) => env.chainId === chainId);
}
