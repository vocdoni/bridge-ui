// This file is evaluated when exporting the frontend application
// The environment variabled need to be set locally on in the CI/CD console

const lang = "en";
const COMMIT_SHA = process.env.COMMIT_SHA || "development";

module.exports = {
  COMMIT_SHA,
  LANG: lang,
  APP_TITLE: "Aragon Voice",

  // NETWORK
  MAINNET_VOCDONI_ENVIRONMENT: process.env.MAINNET_VOCDONI_ENVIRONMENT || "prod",
  MATIC_VOCDONI_ENVIRONMENT: process.env.MATIC_VOCDONI_ENVIRONMENT || "stg",
  RINKEBY_VOCDONI_ENVIRONMENT: process.env.RINKEBY_VOCDONI_ENVIRONMENT || "dev",

  MAINNET_BOOTNODE_URL: process.env.MAINNET_BOOTNODE_URL || "https://bootnodes.vocdoni.net/gateways.json",
  MATIC_BOOTNODE_URL: process.env.MATIC_BOOTNODE_URL || "https://bootnodes.vocdoni.net/gateways.stg.json",
  RINKEBY_BOOTNODE_URL: process.env.RINKEBY_BOOTNODE_URL || "https://bootnodes.vocdoni.net/gateways.dev.json",

  MAINNET_SIGNALING_ORACLE_URL: process.env.MAINNET_SIGNALING_ORACLE_URL || "https://signaling-oracle.vocdoni.net/dvote",
  MATIC_SIGNALING_ORACLE_URL: process.env.MATIC_SIGNALING_ORACLE_URL || "https://signaling-oracle.dev.vocdoni.net/dvote",
  RINKEBY_SIGNALING_ORACLE_URL: process.env.RINKEBY_SIGNALING_ORACLE_URL || "https://signaling-oracle.dev.vocdoni.net/dvote",

  MAINNET_ARCHIVE_IPNS_ID: process.env.MAINNET_ARCHIVE_IPNS_ID || "k2k4r8prjy8gxj5ozkfvc1n9ih5ssn7yjcu8k3u2v5g2711j8rohu0ks",
  MATIC_ARCHIVE_IPNS_ID: process.env.MATIC_ARCHIVE_IPNS_ID || "",
  RINKEBY_ARCHIVE_IPNS_ID: process.env.RINKEBY_ARCHIVE_IPNS_ID || "",

  DEFAULT_ETH_CHAIN_ID: parseInt(process.env.DEFAULT_ETH_CHAIN_ID || "1") || 1,

  // ANALYTICS
  ANALYTICS_KEY: process.env.ANALYTICS_KEY || "1w2W1aAJRMbVRAgHVOIRVVIh1Nc",

  // API KEYS
  FORTMATIC_API_KEY: process.env.FORTMATIC_API_KEY || "pk_test_A5D318B08D001541",
  PORTIS_DAPP_ID: process.env.PORTIS_DAPP_ID || "4402221a-b7c2-4781-9a0e-b1509dabaa1e",
  WALLET_CONNECT_ID: process.env.WALLET_CONNECT_ID || "b76cba91dc954ceebff27244923224b1",
};

console.log("Building the frontend with ENV:", module.exports);
