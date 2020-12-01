const withLess = require('@zeit/next-less')
const env = require("./env-config.js")

// Where your antd-custom.less file lives
module.exports = withLess({
    env,
    trailingSlash: true,
    exportPathMap: () => generatePathMap(),
})

///////////////////////////////////////////////////////////////////////////////
// HELPERS
///////////////////////////////////////////////////////////////////////////////

async function generatePathMap() {
    return {
        '/': { page: '/' },
        '/dashboard': { page: '/dashboard' },
        '/processes': { page: '/processes' },
        '/processes/new': { page: '/processes/new' },
        '/tokens': { page: '/tokens' },
        '/tokens/info': { page: '/tokens/info' },
        '/tokens/add': { page: '/tokens/add' },
    }
}
