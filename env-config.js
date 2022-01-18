// This file is evaluated when exporting the frontend application
// The environment variabled need to be set locally on in the CI/CD console

const lang = "en";
const COMMIT_SHA = process.env.COMMIT_SHA || "development";

module.exports = {
  COMMIT_SHA,
  LANG: lang,
  APP_TITLE: "Aragon Voice",

  // ANALYTICS
  ANALYTICS_KEY: process.env.ANALYTICS_KEY || "1w2W1aAJRMbVRAgHVOIRVVIh1Nc",

  FORTMATIC_API_KEY: process.env.FORTMATIC_API_KEY || "pk_test_A5D318B08D001541",
  PORTIS_DAPP_ID: process.env.PORTIS_DAPP_ID || "4402221a-b7c2-4781-9a0e-b1509dabaa1e",
  WALLET_CONNECT_ID: process.env.WALLET_CONNECT_ID || "b76cba91dc954ceebff27244923224b1",
};

console.log("Building the frontend with ENV:", module.exports);
