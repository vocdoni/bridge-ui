const withLess = require('@zeit/next-less')
const env = require("./env-config.js")

// Where your antd-custom.less file lives
module.exports = withLess({
    env,
    exportTrailingSlash: true,
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
        '/tokens': { page: '/tokens' },
    }
}
