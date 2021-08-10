const env = require("./env-config.js");

module.exports = {
  trailingSlash: true,
  env,
  // TODO: if we use the latest version of useWallet multichain
  // webpack needs to handle image loadder properly
  // the bellow commented config do loads the images
  // but the app still don't work, perhaps the path is not correct
  // more configuration is needed

  // webpack: (config, options) => {
  //   config.module.rules.push({
  //     test: /\.(png|jpe?g|gif|svg|ico)(\?.*)?$/,
  //     use: [
  //       options.defaultLoaders.babel,
  //       {
  //         loader: "emit-file-loader",
  //         options: {
  //           name: "dist/[path][name].[ext]",
  //         },
  //       },
  //       {
  //         loader: "file-loader",
  //         options: {
  //           name: "dist/[path][name].[ext]",
  //         },
  //       },
  //     ],
  //   });

  //   return config;
  // },
};
