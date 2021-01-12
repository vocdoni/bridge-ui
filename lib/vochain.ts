import { GatewayPool } from "dvote-js"

let pool: GatewayPool

export function connectVochain(): Promise<void> {
    return GatewayPool.discover({
        bootnodesContentUri: process.env.BOOTNODES_URL,
        networkId: process.env.ETH_NETWORK_ID as any,
    }).then(discoveredPool => {
        pool = discoveredPool
        return pool.init()
    })
}

export function disconnectVochain() {
    return pool && pool.disconnect && pool.disconnect()
}

export function getPool() {
    return pool
}
