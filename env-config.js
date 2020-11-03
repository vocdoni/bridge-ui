// This file is evaluated when exporting the frontend application
// The environment variabled need to be set locally on in the CI/CD console

const lang = "en"
const DEVELOPMENT = process.env.NODE_ENV !== "production"

module.exports = {
    LANG: lang,
    DEVELOPMENT,
    FALLBACK_REDIRECT_URL: "https://bridge.vocdoni.net/",

    // BLOCKCHAIN
    ETH_NETWORK_ID: process.env.ETH_NETWORK_ID || "homestead",

    // GATEWAYS
    BOOTNODES_URL: DEVELOPMENT ? "https://bootnodes.vocdoni.net/gateways.json" : (process.env.BOOTNODES_URL || "https://bootnodes.vocdoni.net/gateways.json"),

    // VOCHAIN
    BLOCK_TIME: 10, // 10 seconds
}

console.log("Building the frontend with ENV:", module.exports)

