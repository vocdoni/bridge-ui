import Dexie from "dexie";
import { EthNetworkID } from "dvote-js";
import { NonExistingCaseError } from "./errors";

import { TokenInfo } from "./types";
import { throwIfNotBrowser } from "./utils";

export class VoiceStorage extends Dexie {
  // number = type of the primkey
  tokensMainnet: Dexie.Table<TokenInfo, number>;
  tokensRinkeby: Dexie.Table<TokenInfo, number>;

  constructor() {
    super("VoiceStorage");
    throwIfNotBrowser();

    this.version(2).stores({
      tokensMainnet: "&address",
      tokensRinkeby: "&address",
    });

    // This is needed if your typescript is compiled using babel instead of tsc:
    this.tokensMainnet = this.table("tokensMainnet");
    this.tokensRinkeby = this.table("tokensRinkeby");
  }

  writeToken(token: TokenInfo, environment: EthNetworkID): Promise<any> {
    const t = this.getTable(environment);
    return t.put(token).catch((err) => console.error("Incognito mode might be on", err));
  }

  /** Persists any of the given tokens into IndexedDB. If they already exist, it overwrites their values. */
  writeTokens(tokens: TokenInfo[], environment: EthNetworkID): Promise<any> {
    const t = this.getTable(environment);
    return Promise.all(tokens.map((tokenInfo) => t.put(tokenInfo))).catch((err) =>
      console.error("Incognito mode might be on", err)
    );
  }

  readToken(address: string, environment: EthNetworkID): Promise<TokenInfo[]> {
    return this.getTable(environment)
      .where("address")
      .equalsIgnoreCase(address)
      .toArray()
      .catch((err) => {
        console.error("Incognito mode might be on", err);
        return [];
      });
  }

  readTokens(addresses: string[], environment: EthNetworkID): Promise<TokenInfo[]> {
    const t = this.getTable(environment);
    return t
      .toArray()
      .then((tokenInfos) => {
        return tokenInfos.filter((ti) => {
          return addresses.some((a) => a === ti.address);
        });
      })
      .catch((err) => {
        console.error("Incognito mode might be on", err);
        return [];
      });
  }

  readAllTokens(environment: EthNetworkID): Promise<TokenInfo[]> {
    const t = this.getTable(environment);
    return t.toArray().catch((err) => {
      console.error("Incognito mode might be on", err);
      return [];
    });
  }

  getNumberOfTokens(environment: EthNetworkID): Promise<number> {
    const t = this.getTable(environment);
    return t.count();
  }

  private getTable(environment: EthNetworkID): Dexie.Table<TokenInfo, number> {
    switch (environment) {
      case "mainnet":
        return this.tokensMainnet;
      case "rinkeby":
        return this.tokensRinkeby;
      default:
        throw new NonExistingCaseError();
    }
  }
}
