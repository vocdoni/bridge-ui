import Dexie from 'dexie'
// import { TokenEntry } from './types'
import { throwIfNotBrowser } from './util'


// INDEX DB Wrappers

type TokenAddress = { address: string }

/** Provides access to a local cache DB, containing the last known list of registered token addresses */
export class TokenListCache extends Dexie {
    tokens: Dexie.Table<TokenAddress, number> // number = type of the primkey

    /** Provides access to a local cache DB, containing the last known list of registered token addresses */
    constructor() {
        super("BridgeTokenList")
        throwIfNotBrowser()

        // For newer versions, DO NOT REMOVE any lines. Simply add new ones below.
        this.version(1).stores({
            tokens: '++id,address'
        })

        // The following line is needed if your typescript
        // is compiled using babel instead of tsc:
        this.tokens = this.table("tokens")
    }

    write(tokens: string[]) {
        return this.tokens.clear()
            .then(() => {
                this.tokens.bulkAdd(tokens.map(a => ({ id: a, address: a })))
            })
    }

    read(): Promise<string[]> {
        return this.tokens.toArray()
            .then(tokens => tokens.map(t => t.address))
    }
}


// TODO: Ready for future use => Caching the loaded token info

// /** Provides access to a local cache DB, containing the last known state for a token */
// export class TokenCache extends Dexie {
//     tokens: Dexie.Table<TokenEntry, number> // number = type of the primkey

//     /** Provides access to a local cache DB, containing the last known state for a token */
//     constructor() {
//         super("BridgeTokenData")
//         throwIfNotBrowser()

//         // For newer versions, DO NOT REMOVE any lines. Simply add new ones below.
//         this.version(1).stores({
//             tokens: '++id,name'
//         })

//         this.tokens = this.table("tokens")
//     }

//     write(tokens: TokenEntry[]) {
//         return this.tokens.clear()
//             .then(() => {
//                 this.tokens.bulkAdd(tokens)
//             })
//     }

//     read(): Promise<TokenEntry[]> {
//         return this.tokens.toArray()
//     }
// }
