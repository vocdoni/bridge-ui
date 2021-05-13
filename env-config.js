// This file is evaluated when exporting the frontend application
// The environment variabled need to be set locally on in the CI/CD console

const lang = "en";
const DEVELOPMENT = process.env.NODE_ENV !== "production";

module.exports = {
  LANG: lang,
  APP_TITLE:
    "Aragon Voice - the ultimate solution for creating and managing proposals and voting in a decentralized, cost-effective, and secure manner",
  DEVELOPMENT,
  VOCDONI_ENVIRONMENT: process.env.VOCDONI_ENVIRONMENT || "dev",

  // BLOCKCHAIN
  ETH_NETWORK_ID: process.env.ETH_NETWORK_ID || "goerli",
  ETH_CHAIN_ID: process.env.ETH_CHAIN_ID ? parseInt(process.env.ETH_CHAIN_ID) : 5,
  ETHERSCAN_PREFIX: process.env.ETH_CHAIN_ID || "https://goerli.etherscan.io",

  // VOCHAIN
  BLOCK_TIME: process.env.BLOCK_TIME || "12",

  // GATEWAYS
  BOOTNODES_URL: process.env.BOOTNODES_URL || "https://bootnodes.vocdoni.net/gateways.dev.json",

  // ANALYTICS
  ANALYTICS_KEY: process.env.ANALYTICS_KEY || "4ohZSOqAi2Wy0pDuzFPB7fDN5XirRjsq",
};

console.log("Building the frontend with ENV:", module.exports);
