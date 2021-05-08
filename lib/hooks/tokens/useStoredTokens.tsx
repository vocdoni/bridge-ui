import React, { useContext, useEffect, useState } from "react";
import { usePool } from "@vocdoni/react-hooks";

import { getRegisteredTokenList, getTokenInfo } from "../../api";
import { useMessageAlert } from "../message-alert";
import { VoiceStorage } from "../../storage";
import { TokenInfo } from "../../types";
import { GatewayPool } from "dvote-js";

interface StoredTokens {
  storedTokens: TokenInfo[];
  refresh: any;
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
    throw new Error(
      "useStoredTokens() can only be used inside of <UseStoredTokensProvider />, " +
      "please declare it at a higher level."
    );
  }
  return tokenContext;
}

// These are the tokens we want to show at first
// Convert this to an array of tokens
export function UseStoredTokensProvider({ children }) {
  const { poolPromise } = usePool();
  const { setAlertMessage } = useMessageAlert();
  const [storedTokens, setStoredTokens] = useState<TokenInfo[]>([]);
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string>(null)

  useEffect(() => {
    readFromStorage()
      .then(() => fetchStoredTokens())
  }, []);

  const readFromStorage = () => {
    const storage = new VoiceStorage();

    return storage.readTokens()
      .then(StoredTokens => {
        setStoredTokens(StoredTokens || []);
      });
  };

  const writeToStorage = (tokens: TokenInfo[]) => {
    const storage = new VoiceStorage();

    return storage.writeTokens(tokens);
  };

  const fetchStoredTokens = () => {
    let pool: GatewayPool
    setLoading(true);

    return poolPromise
      .then(gwPool => {
        pool = gwPool;
        return getRegisteredTokenList(storedTokens?.length || 0, pool);
      })
      .then(tokenList => Promise.all(tokenList.map(addr => getTokenInfo(addr, pool))))
      .then(tokenInfoList => {
        setLoading(false);
        setError(null);

        setStoredTokens(tokenInfoList);
        writeToStorage(tokenInfoList);
      })
      .catch(err => {
        setLoading(false);
        setError("Could not fetch the list of tokens");
      });
  };

  useEffect(() => {
    if (error) setAlertMessage(error);
  }, [error]);

  return (
    <UseStoredTokensContext.Provider
      value={{
        storedTokens,
        refresh: fetchStoredTokens,
        error,
        loading
      }}
    >
      {children}
    </UseStoredTokensContext.Provider>
  );
}
