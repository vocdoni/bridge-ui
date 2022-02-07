import Dexie from "dexie";
import { EthNetworkID } from "@vocdoni/common";

import { NonExistingCaseError } from "./errors";
import { TokenAddress, TokenInfo } from "./types";
import { throwIfNotBrowser } from "./utils";

export class VoiceStorage extends Dexie {
  // number = type of the primkey
  tokensMainnet: Dexie.Table<TokenInfo, number>;
  tokensRinkeby: Dexie.Table<TokenInfo, number>;
  tokensMatic: Dexie.Table<TokenInfo, number>;

  constructor() {
    super("VoiceStorage");
    throwIfNotBrowser();

    // NOTE: THE SCHEMA DEFINITION IS APPEND-ONLY
    this.version(2).stores({
      tokensMainnet: "&address",
      tokensRinkeby: "&address",
      tokensMatic: "&address",
    });

    // This is needed if your typescript is compiled using babel instead of tsc:
    this.tokensMainnet = this.table("tokensMainnet");
    this.tokensRinkeby = this.table("tokensRinkeby");
    this.tokensMatic = this.table("tokensMatic");
  }

  /** Persists the given tokens into IndexedDB. If it already exist, it overwrites its values. */
  writeToken(token: TokenInfo, environment: EthNetworkID): Promise<any> {
    const t = this.getTable(environment);
    const storeToken = { ...token };
    storeToken.address = storeToken.address.toLowerCase();
    return t.put(storeToken).catch((err) => console.error("Incognito mode might be on", err));
  }

  /** Persists any of the given tokens into IndexedDB. If they already exist, it overwrites their values. */
  writeTokens(tokens: TokenInfo[], environment: EthNetworkID): Promise<any> {
    const t = this.getTable(environment);
    return Promise.all(tokens.map((tokenInfo) => {
      const storeToken = { ...tokenInfo };
      storeToken.address = storeToken.address.toLowerCase();
      return t.put(storeToken)
    })).catch((err) =>
      console.error("Incognito mode might be on", err)
    );
  }

  /**
   * Retrieve information about a token from indexedDB for the given token address
   *
   * Note: To simplify typing, this method returns an array of TokenInformation containing
   * a single element.
   *
   * @param  {TokenAddress} address
   * @param  {EthNetworkID} environment
   * @returns {Promise<TokenInfo[]>} A promise resolving to a list of token information
   * containing one element.
   */
  readToken(address: TokenAddress, environment: EthNetworkID): Promise<TokenInfo[]> {
    return this.getTable(environment)
      .where("address")
      .equalsIgnoreCase(address)
      .toArray()
      .catch((err) => {
        console.error("Incognito mode might be on", err);
        return [];
      });
  }

  /**
   * Retrieve information about tokens from indexedDB for a given list of token addresses (for a specific network).
   *
   * @param  {TokenAddress[]} address
   * @param  {EthNetworkID} environment
   * @returns {Promise<TokenInfo[]>} A promise resolving to a list of token information.
   */
  readTokens(addresses: TokenAddress[], environment: EthNetworkID): Promise<TokenInfo[]> {
    const t = this.getTable(environment);
    return t
      .toArray()
      .then((tokenInfos) => {
        return tokenInfos.filter((ti) => {
          // ti.address is already lowercase (see writeToken/s above)
          return addresses.some((a) => a.toLowerCase() === ti.address);
        });
      })
      .catch((err) => {
        console.error("Incognito mode might be on", err);
        return [];
      });
  }

  /**
   * Retrieve information about all tokens currently stored on indexedDB (for a specific network).
   *
   * @param  {EthNetworkID} environment
   * @returns {Promise<TokenInfo[]>}
   */
  readAllTokens(environment: EthNetworkID): Promise<TokenInfo[]> {
    const t = this.getTable(environment);
    return t.toArray().catch((err) => {
      console.error("Incognito mode might be on", err);
      return [];
    });
  }

  /**
   * Counts how many tokens are currently stored on indexedDB (for a specific network).
   *
   * @param  {EthNetworkID} environment
   * @returns {Promise<TokenInfo[]>}
   */
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
      case "matic":
        return this.tokensMatic;
      default:
        throw new NonExistingCaseError();
    }
  }
}
