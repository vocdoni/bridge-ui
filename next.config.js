const env = require("./env-config.js");
var DuplicatePackageCheckerPlugin = require("duplicate-package-checker-webpack-plugin");
const CompressionPlugin = require("compression-webpack-plugin");
const path = require('path');

module.exports = {
  trailingSlash: true,
  env,
  productionBrowserSourceMaps: true,
  future: {
    webpack5: true
  },
  plugins: [new DuplicatePackageCheckerPlugin()],
  webpack(config) {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
    };
    config.plugins.push(new DuplicatePackageCheckerPlugin())
    config.plugins.push(
        new CompressionPlugin({
          compressionOptions: { deleteOriginalAssets: true,test: /\.js$|\.css$|\.html$/, algorithm: "gzip" },
        }),
    )
    config.resolve.alias['bn.js'] = path.resolve(
      __dirname,
      'node_modules',
      'bn.js'
    )
    return config;
  }
};
