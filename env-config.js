// This file is evaluated when exporting the frontend application
// The environment variabled need to be set locally on in the CI/CD console

const lang = "en";
const COMMIT_SHA = process.env.COMMIT_SHA || "development";

module.exports = {
  COMMIT_SHA,
  LANG: lang,
  APP_TITLE:
    "Aragon Voice - the ultimate solution for creating and managing proposals and voting in a decentralized, cost-effective, and secure manner",
  ANALYTICS_KEY: process.env.ANALYTICS_KEY || "1w2W1aAJRMbVRAgHVOIRVVIh1Nc",
  FORTMATIC_API_KEY: process.env.FORTMATIC_API_KEY || "pk_test_A5D318B08D001541",
};

console.log("Building the frontend with ENV:", module.exports);
