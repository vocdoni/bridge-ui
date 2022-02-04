import { EthNetworkID, VocdoniEnvironment } from "@vocdoni/common";

export const ETH_BLOCK_HEIGHT_PADDING = 10;

type NetworkEnv = {
  bootnodeUrl: string,
  signalingOracle: string,
  vocdoniEnvironment: VocdoniEnvironment,
  archiveIpnsId?: string
}

interface BuildArgumengs {
  defaultLang: string,
  defaultEthChainId: number,
  environment: "development" | "production" | "test";
  commitSha: string;
  appTitle: string;
  analyticsKey: string;
  fortmaticKey: string;
  walletConnectId: string;
  // Networks
  mainnet: NetworkEnv;
  matic: NetworkEnv;
  rinkeby: NetworkEnv;
}

/*  Maybe have singleton objects with fields derived from env directly */
export const BUILD: BuildArgumengs = {
  defaultLang: "en",
  defaultEthChainId: parseInt(process.env.DEFAULT_ETH_CHAIN_ID || "1"),
  environment: process.env.NODE_ENV || "development",
  commitSha: process.env.COMMIT_SHA,
  appTitle: process.env.APP_TITLE || "Aragon Voice",
  analyticsKey: process.env.ANALYTICS_KEY,
  fortmaticKey: process.env.FORTMATIC_API_KEY,
  walletConnectId: process.env.WALLET_CONNECT_ID,
  mainnet: {
    bootnodeUrl: process.env.MAINNET_BOOTNODE_URL,
    signalingOracle: process.env.MAINNET_SIGNALING_ORACLE_URL,
    vocdoniEnvironment: process.env.MAINNET_VOCDONI_ENVIRONMENT as VocdoniEnvironment,
    archiveIpnsId: process.env.MAINNET_ARCHIVE_IPNS_ID
  },
  matic: {
    bootnodeUrl: process.env.MATIC_BOOTNODE_URL,
    signalingOracle: process.env.MATIC_SIGNALING_ORACLE_URL,
    vocdoniEnvironment: process.env.MATIC_VOCDONI_ENVIRONMENT as VocdoniEnvironment,
    archiveIpnsId: process.env.MATIC_ARCHIVE_IPNS_ID
  },
  rinkeby: {
    bootnodeUrl: process.env.RINKEBY_BOOTNODE_URL,
    signalingOracle: process.env.RINKEBY_SIGNALING_ORACLE_URL,
    vocdoniEnvironment: process.env.RINKEBY_VOCDONI_ENVIRONMENT as VocdoniEnvironment,
    archiveIpnsId: process.env.RINKEBY_ARCHIVE_IPNS_ID
  },
};

export interface NetworkVariables {
  chainId: number;
  networkName: EthNetworkID;
  etherscanPrefix: string;
  blockTime: number;
  bootnodesUrl: string;
  singalingOracleUrl: string;
  vocdoniEnvironment: VocdoniEnvironment;
  archiveIpnsId?: string;
}

const ENVIRONMENTS: NetworkVariables[] = [
  {
    chainId: 1,
    networkName: "mainnet",
    etherscanPrefix: "https://etherscan.io",
    blockTime: 10,
    bootnodesUrl: BUILD.mainnet.bootnodeUrl,
    singalingOracleUrl: BUILD.mainnet.signalingOracle,
    vocdoniEnvironment: BUILD.mainnet.vocdoniEnvironment,
    archiveIpnsId: BUILD.mainnet.archiveIpnsId
  },
  {
    chainId: 4,
    networkName: "rinkeby",
    etherscanPrefix: "https://rinkeby.etherscan.io",
    blockTime: 10,
    bootnodesUrl: BUILD.rinkeby.bootnodeUrl,
    singalingOracleUrl: BUILD.rinkeby.signalingOracle,
    vocdoniEnvironment: BUILD.rinkeby.vocdoniEnvironment,
  },
  {
    chainId: 137,
    networkName: "matic",
    etherscanPrefix: "https://polygonscan.com/",
    blockTime: 10,
    bootnodesUrl: BUILD.matic.bootnodeUrl,
    singalingOracleUrl: BUILD.matic.signalingOracle,
    vocdoniEnvironment: BUILD.matic.vocdoniEnvironment,
  }
];

/**
 * Depending on the environment (set by the user via their wallet), the app must display
 * different information that relies on the Network variables. If the network changes,
 * this function will look for and return the right variables. In the case where a chainId
 * is passed that is not supported, the app defaults back to mainnet.
 *
 * @param chainId chain number as specified by
 * @returns Environment variables for requested chain. Returns values for mainnet if
 * chainId is unsupported.
 */
export function getNetworkVars(chainId: number): NetworkVariables {
  const newEnv = ENVIRONMENTS.find((env) => env.chainId === chainId);
  if (!newEnv) return ENVIRONMENTS[0];

  return newEnv;
}
