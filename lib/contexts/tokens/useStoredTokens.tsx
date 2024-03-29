import React, { useContext, useEffect, useState } from "react";
import { usePool } from "@vocdoni/react-hooks";
import { BigNumber } from "@ethersproject/bignumber";

import { getRegisteredTokenList, getTokenInfo } from "../../api";
import { useMessageAlert } from "../message-alert";
import { VoiceStorage } from "../../storage";
import { TokenInfo, HookData } from "../../types";
import { OutsideProviderError } from "../../errors";
import { useEnvironment } from "../../hooks/useEnvironment";

export type TokenInfos = {
  tokens: TokenInfo[];
  chainId: number;
};

export type StoredTokens = HookData<TokenInfos> & {
  /** Cache the given tokens into IndexDB */
  storeTokens: (newTokenList: TokenInfo[]) => Promise<any>;
  /** Refresh the list of registered tokens and cache any new ones */
  refresh: (cachedTokens?: TokenInfo[]) => Promise<void>;
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
  const { networkName, chainId } = useEnvironment();
  const { poolPromise } = usePool();
  const { setAlertMessage } = useMessageAlert();

  const [storedTokens, setStoredTokens] = useState<TokenInfos>({ tokens: [], chainId: 1 });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error>(null);

  useEffect(() => {
    setIsLoading(true);
    const asyncEffect = async () => {
      try {
        const dbTokensInfo = await readFromStorage();
        await fetchNewRegisteredTokens(dbTokensInfo);
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
  /**
   * Fetches the info of tokens that are newly registered (and therefore not yet stored in
   * indexedDB) from the web3 endpoints. The info is then added to both IndexedDB and this
   * component's state.
   *
   * @returns void
   */
  const fetchNewRegisteredTokens = async (cachedTokens?: TokenInfo[]) => {
    if (!cachedTokens) cachedTokens = storedTokens.tokens;

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
        const addressesChunk = newTokenAddresses.slice(i, i + inc);
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

      setStoredTokens({ tokens: cachedTokens, chainId: chainId });
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
