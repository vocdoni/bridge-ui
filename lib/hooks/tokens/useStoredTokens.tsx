import React, { useContext, useEffect, useState } from "react";
import { usePool } from "@vocdoni/react-hooks";
import { GatewayPool } from "dvote-js";
import { BigNumber } from "@ethersproject/bignumber";

import { getRegisteredTokenList, getTokenInfo } from "../../api";
import { useMessageAlert } from "../message-alert";
import { VoiceStorage } from "../../storage";
import { TokenInfo } from "../../types";
import { OutsideProviderError } from "../../errors";

type FilteredTokens = {
  storedTokens: TokenInfo[];
  error?: string;
  loading: boolean;
};

function doesTokenInfocontainTerm(token: TokenInfo, term: string) {
  const lowercaseTerm = term.toLocaleLowerCase();
  const lowercaseSymbol = token.symbol.toLocaleLowerCase();
  const lowercaseAddress = token.address.toLocaleLowerCase();
  const lowercaseName = token.name.toLocaleLowerCase();
  return (
    lowercaseSymbol.indexOf(lowercaseTerm) >= 0 ||
    lowercaseName.indexOf(lowercaseTerm) >= 0 ||
    lowercaseAddress.indexOf(lowercaseTerm) >= 0
  );
}
export const useFilteredTokens = (searchTerm: string): FilteredTokens => {
  const { storedTokens, error, loading } = useStoredTokens();

  if (loading) return { storedTokens, error, loading };

  const filteredTokens = !searchTerm
    ? storedTokens
    : storedTokens.filter((t) => doesTokenInfocontainTerm(t, searchTerm));

  return { storedTokens: filteredTokens, error, loading };
};

export interface StoredTokens {
  /** The currently cached tokens */
  storedTokens: TokenInfo[];
  /** Cache the given tokens into IndexDB */
  storeTokens: (newTokenList: TokenInfo[]) => Promise<any>;
  /** Refresh the list of registered tokens and cache any new ones */
  refresh: () => Promise<any>;
  error?: string;
  loading: boolean;
}

const UseStoredTokensContext = React.createContext<StoredTokens>(null);

/**
 * Returns an array containing the list of registered ERC20 tokens.
 * The list is persisted on IndexDB
 * */
export function useStoredTokens() {
  const tokenContext = useContext(UseStoredTokensContext);

  if (tokenContext === null) {
    throw new OutsideProviderError("useStoredTokens()", "<UseStoredTokensProvider />");
  }
  return tokenContext;
}

// These are the tokens we want to show at first
// Convert this to an array of tokens
export function UseStoredTokensProvider({ children }) {
  const { poolPromise } = usePool();
  const { setAlertMessage } = useMessageAlert();
  const [storedTokens, setStoredTokens] = useState<TokenInfo[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    readFromStorage() // IndexDB
      .then(() => fetchNewStoredTokens()); // Web3
  }, []);

  /** Reads the current token info array fron IndexDB */
  const readFromStorage = () => {
    const storage = new VoiceStorage();

    return storage.readTokens().then((storedTokens) => {
      const result: TokenInfo[] = (storedTokens || []).map((item) => {
        return {
          totalSupply: BigNumber.from(item.totalSupply?._hex || item.totalSupply),
          ...item,
        };
      });
      setStoredTokens(result);
    });
  };

  /** Persists any of the given tokens into IndexedDB. If they already exist, it overwrites their values. */
  const writeToStorage = (tokens: TokenInfo[]) => {
    const storage = new VoiceStorage();

    return storage.writeTokens(tokens);
  };

  const fetchNewStoredTokens = () => {
    let pool: GatewayPool;
    setLoading(true);

    return poolPromise
      .then((p) => {
        pool = p;
        return getRegisteredTokenList(storedTokens?.length || 0, p);
      })
      .then((tokenList) => {
        // Fetches the details of the non-stored tokens
        const newTokens: string[] = [];
        for (let i = 0; i < tokenList.length; i++) {
          const included = storedTokens.some(
            (t) => t.address.toLowerCase() == tokenList[i].toLowerCase()
          );
          if (included) continue;

          newTokens.push(tokenList[i]);
        }
        return Promise.all(newTokens.map((addr) => getTokenInfo(addr, pool)));
      })
      .then((newTokenListInfo) => {
        setLoading(false);
        setError(null);

        setStoredTokens(storedTokens.concat(newTokenListInfo));
        writeToStorage(newTokenListInfo);
      })
      .catch((err) => {
        setLoading(false);
        /* Errors can get too large and specific to display as toast to users. Use
abbreviated message i toast and explicit message in console */
        console.error("Could not update the list of tokens because: " + err);
        setError("Could not update the list of tokens");
      });
  };

  useEffect(() => {
    if (error) setAlertMessage(error);
  }, [error]);

  return (
    <UseStoredTokensContext.Provider
      value={{
        storedTokens,
        storeTokens: writeToStorage,
        refresh: fetchNewStoredTokens,
        error,
        loading,
      }}
    >
      {children}
    </UseStoredTokensContext.Provider>
  );
}
