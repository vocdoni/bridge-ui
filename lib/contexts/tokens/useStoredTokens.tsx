import React, { useContext, useEffect, useState } from "react";
import { usePool } from "@vocdoni/react-hooks";
import { BigNumber } from "@ethersproject/bignumber";

import { getRegisteredTokenList, getTokenInfo } from "../../api";
import { useMessageAlert } from "../message-alert";
import { VoiceStorage } from "../../storage";
import { TokenInfo, UseData } from "../../types";
import { OutsideProviderError } from "../../errors";
import { useEnvironment } from "../useEnvironment";
import { getSlice } from "../../utils";

export type StoredTokens = UseData<TokenInfo[]> & {
  /** Cache the given tokens into IndexDB */
  storeTokens: (newTokenList: TokenInfo[]) => Promise<any>;
  /** Refresh the list of registered tokens and cache any new ones */
  refresh: () => Promise<void>;
};

const UseStoredTokensContext = React.createContext<StoredTokens>(null);

/**
 * Returns an array containing the list of registered ERC20 tokens.
 * The list is persisted on IndexDB
 * */
export function useStoredTokens(): StoredTokens {
  const tokenContext = useContext(UseStoredTokensContext);

  if (tokenContext === null) {
    throw new OutsideProviderError("useStoredTokens()", "<UseStoredTokensProvider />");
  }
  return tokenContext;
}

/**
 * Provides the StoredTokens Context to the entire application.
 *
 * The provider loads data from IndexedDB. If additional data exists on web3, it loads
 * that data as well and then stores it to IndexedDB.
 *
 * @param children React child node
 * @returns useStoredTokens Provider
 */
export function UseStoredTokensProvider({ children }) {
  const { networkName } = useEnvironment();
  const { poolPromise } = usePool();
  const { setAlertMessage } = useMessageAlert();

  const [storedTokens, setStoredTokens] = useState<TokenInfo[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error>(null);

  useEffect(() => {
    const asyncEffect = async () => {
      setIsLoading(true);
      try {
        const dbTokensInfo = await readFromStorage();
        await fetchNewRegisteredTokensAsync(dbTokensInfo);
      } catch (error) {
        console.error("Could not update the list of tokens because: " + error);
        setError(new Error("Could not update the list of tokens"));
      } finally {
        setIsLoading(false);
      }
    };
    asyncEffect();
  }, [poolPromise]);

  /**
   * Reads the info of tokens stored in IndexedDB and stores them in this component's
   * state.
   *
   * @returns Promise<TokenInfo[]>
   */
  const readFromStorage = async () => {
    const storage = new VoiceStorage();

    const storedTokenInfo = await storage.readAllTokens(networkName);
    return (storedTokenInfo || []).map((item) => {
      return {
        totalSupply: BigNumber.from(item.totalSupply?._hex || item.totalSupply),
        ...item,
      };
    });
  };

  //TODO change hook signature and replace this with async version
  /**
   * Fetches the info of tokens that are newly registered (and therefore not yet stored in
   * indexedDB) from the web3 endpoints. The info is then added to both IndexedDB and this
   * component's state.
   *
   * @returns void
   */
  const fetchNewRegisteredTokens = () => {
    return poolPromise
      .then((gwp) => {
        return Promise.all([getRegisteredTokenList(0, gwp), gwp]);
      })
      .then(([registeredTokens, gwp]) => {
        // filter out registered tokens we already store.
        const alreadyStored = (token: string) => {
          return storedTokens.some((st) => st.address.toLowerCase() == token.toLowerCase());
        };
        const newTokenAddresses: string[] = registeredTokens.filter((rt) => !alreadyStored(rt));

        const getSlice = (curr, step, max) => {
          const next = curr + step;
          if (next > max) return [curr, max];
          else return [curr, next];
        };

        //fetch token infos in small chunk, untill there are no new token addresses
        const inc = 10;
        for (let i = 0; i < newTokenAddresses.length; i += inc) {
          const [lo, hi] = getSlice(i, inc, newTokenAddresses.length);
          const addressesChunk = newTokenAddresses.slice(lo, hi);

          // Fetch token info of the registered tokens we do not yet store.
          return Promise.all(newTokenAddresses.map((addr) => getTokenInfo(addr, gwp)));
        }
      })
      .then((newTokenListInfo) => {
        setError(null);
        setStoredTokens(storedTokens.concat(newTokenListInfo));
        writeToStorage(newTokenListInfo);
      });
  };

  /**
   * Reads the info of tokens stored in IndexedDB and stores them in this component's
   * state.
   *
   * @returns Promise<void>
   */
  const fetchNewRegisteredTokensAsync = async (cachedTokens: TokenInfo[]) => {
    try {
      const pool = await poolPromise;
      const registeredTokens = await getRegisteredTokenList(0, pool);

      // filter out registered tokens we already store.
      const alreadyStored = (token: string) => {
        return cachedTokens.some((st) => st.address.toLowerCase() == token.toLowerCase());
      };
      const newTokenAddresses: string[] = registeredTokens.filter((rt) => !alreadyStored(rt));

      //fetch token infos in small chunk, untill there are no new token addresses
      const inc = 10;
      for (let i = 0; i < newTokenAddresses.length; i += inc) {
        // get chunk
        const [lo, hi] = getSlice(i, inc, newTokenAddresses.length);
        const addressesChunk = newTokenAddresses.slice(lo, hi);

        // Fetch token info of the registered tokens we do not yet store.
        const tokenInfoChunk = await Promise.all(
          addressesChunk.map((addr) => getTokenInfo(addr, pool))
        );

        // accumulate results
        cachedTokens.push(...tokenInfoChunk);
      }

      /* NOTE Currently, token info is aggregated and only made available to consumers
       * when all the token information is loaded. This is done so that the data is only
       * made avialable at the same time the loading indicator is set to false.
       * */
      /* TODO This should be improved by designing new logic for both data readiness
       * (provide data in chunks) and loading indicator.
       * */

      setStoredTokens(cachedTokens);
      writeToStorage(cachedTokens);
      setError(null);
    } catch (error) {
      throw new Error(error);
    }
  };

  /**
   * Persists any of the given tokens into IndexedDB. If they already exist, it
   * overwrites their values.
   *
   * @param tokens Array of token info to be stored in indexedDB
   * @returns void
   */
  const writeToStorage = (tokens: TokenInfo[]) => {
    const storage = new VoiceStorage();
    return storage.writeTokens(tokens, networkName);
  };

  useEffect(() => {
    if (error) setAlertMessage(error.message);
  }, [error]);

  return (
    <UseStoredTokensContext.Provider
      value={{
        data: storedTokens,
        isLoading,
        error,
        storeTokens: writeToStorage,
        refresh: fetchNewRegisteredTokens,
      }}
    >
      {children}
    </UseStoredTokensContext.Provider>
  );
}
