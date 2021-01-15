// This file is evaluated when exporting the frontend application
// The environment variabled need to be set locally on in the CI/CD console

const lang = "en"
const DEVELOPMENT = process.env.NODE_ENV !== "production"

module.exports = {
    LANG: lang,
    DEVELOPMENT,

    // BLOCKCHAIN
    ETH_NETWORK_ID: process.env.ETH_NETWORK_ID || "goerli",
    ETH_CHAIN_ID: process.env.ETH_CHAIN_ID ? parseInt(process.env.ETH_CHAIN_ID) : 5,
    ETHERSCAN_PREFIX: process.env.ETH_CHAIN_ID || "https://goerli.etherscan.io",

    // VOCHAIN
    BLOCK_TIME: process.env.BLOCK_TIME || "12",

    // GATEWAYS
    BOOTNODES_URL: DEVELOPMENT ? "https://bootnodes.vocdoni.net/gateways.dev.json" : (process.env.BOOTNODES_URL || "https://bootnodes.vocdoni.net/gateways.json"),
}

console.log("Building the frontend with ENV:", module.exports)

