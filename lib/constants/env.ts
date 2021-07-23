import { EthNetworkID, VocdoniEnvironment } from "dvote-js";

export const ETH_BLOCK_HEIGHT_PADDING = 10;
export const GOERLI_MULTICALL = "0x77dca2c955b15e9de4dbbcf1246b4b85b651e50e";
export const EMPTY_ADDRESS = "0x0000000000000000000000000000000000000000";

interface BuildVariables {
  isDevelopment: boolean;
  commitSha: string;
  appTitle: string;
  analyticsKey: string;
  fortmaticKey: string;
}

/*  Maybe have singleton objects with fields derived from env directly */
export const BUILD: BuildVariables = {
  isDevelopment: true,
  commitSha: process.env.COMMIT_SHA,
  appTitle: process.env.APP_TITLE,
  analyticsKey: process.env.ANALYTICS_KEY,
  fortmaticKey: process.env.FORTMATIC_API_KEY,
};

interface NetworkVariables {
  chainId: number;
  networkName: EthNetworkID;
  etherscanPrefix: string;
  blockTime: number;
  bootnodesUrl: string;
  singalingOracleUrl: string;
  vocdoniEnvironment: VocdoniEnvironment;
}

const ENVIRONMENTS: NetworkVariables[] = [
  {
    chainId: 1,
    networkName: "mainnet",
    etherscanPrefix: "https://etherscan.io",
    blockTime: 10,
    bootnodesUrl: "https://bootnodes.vocdoni.net/gateways.json",
    singalingOracleUrl: "https://signaling-oracle.vocdoni.net/dvote",
    vocdoniEnvironment: "prod",
  },
  {
    chainId: 4,
    networkName: "rinkeby",
    etherscanPrefix: "https://rinkeby.etherscan.io",
    blockTime: 12,
    bootnodesUrl: "https://bootnodes.vocdoni.net/gateways.dev.json",
    singalingOracleUrl: "https://signaling-oracle.dev.vocdoni.net/dvote",
    vocdoniEnvironment: "dev",
  },
];

export function getNetworkVars(chainId: number = 4): NetworkVariables {
  console.log(chainId);
  return ENVIRONMENTS.find((env) => env.chainId === chainId);
}
