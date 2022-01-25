const env = require("./env-config.js");

module.exports = {
  trailingSlash: true,
  env,
  productionBrowserSourceMaps: true,
  future: {
    webpack5: true
  },
  webpack(config) {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
    };
    return config;
  }
};
