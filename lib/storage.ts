import Dexie from 'dexie'
import { TokenInfo } from './types'
import { throwIfNotBrowser } from './utils'

// CART STORAGE

export class VoiceStorage extends Dexie {
  tokens: Dexie.Table<TokenInfo, number> // number = type of the primkey

  constructor() {
    super("VoiceStorage")
    throwIfNotBrowser()

    this.version(1).stores({
      tokens: '&address',
      // favorites
      // etc
    })

    // The following line is needed if your typescript
    // is compiled using babel instead of tsc:
    this.tokens = this.table("tokens")
  }

  /** Persists any of the given tokens into IndexedDB. If they already exist, it overwrites their values. */
  writeTokens(tokens: TokenInfo[]): Promise<any> {
    return Promise.all(tokens.map(tokenInfo => this.tokens.put(tokenInfo)))
  }

  readTokens(): Promise<TokenInfo[]> {
    return this.tokens.toArray()
  }
}
