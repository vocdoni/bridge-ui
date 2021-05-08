import React, { useCallback, useContext, useEffect, useState } from "react";
import { usePool } from "@vocdoni/react-hooks";
import useSWR from "swr";

import { getTokenInfo } from "../../api";
import { TokenInfo } from "../../types";
// import { useMessageAlert } from "./../message-alert";
import { useStoredTokens } from "./useStoredTokens";

const UseTokenContext = React.createContext<{
  currentTokens: Partial<TokenInfo>[];
  updateTokens: (value: Partial<TokenInfo>[]) => void;
  resolveTokenInfo: (address: string) => Promise<Partial<TokenInfo>>;
  loading: boolean;
  error?: string;
}>({
  currentTokens: [],
  updateTokens: () => undefined,
  resolveTokenInfo: () => Promise.reject(new Error("Not initialized")),
  loading: false,
  error: ""
});

export function useToken(address: string) {
  const tokenContext = useContext(UseTokenContext);
  const [tokenInfo, setTokenInfo] = useState<Partial<TokenInfo>>()
  // const { setLoadingMessage, hideLoading } = useLoadingAlert()

  if (tokenContext === null) {
    throw new Error(
      "useToken() can only be used inside of <UseTokenProvider />, " +
      "please declare it at a higher level."
    );
  }
  const { resolveTokenInfo, loading, error } = tokenContext

  useEffect(() => {
    if (!address) return;

    resolveTokenInfo(address)
      .then(tokenInfo => setTokenInfo(tokenInfo))
  }, [address])

  return { tokenInfo, error, loading };
}

/** Returns an array containing the available information about the given addresses */
export function useTokens(addresses: string[]) {
  const tokenContext = useContext(UseTokenContext);
  // const { setAlertMessage } = useMessageAlert()

  const fetchTokensInfo = async (addresses: string[]) => {
    // @TODO: Add multicall + fetch of token information
    const fetchPromises = addresses.map((addr) => tokenContext.resolveTokenInfo(addr));
    const allTokensInfo = await Promise.all(fetchPromises);
    tokenContext.updateTokens(allTokensInfo);
    return allTokensInfo;
  };

  useEffect(() => {
    if (addresses) {
      fetchTokensInfo(addresses);
    }
  }, [addresses]);

  if (tokenContext === null) {
    throw new Error(
      "useTokens() can only be used inside of <UseTokenProvider />, " +
      "please declare it at a higher level."
    );
  }
  return tokenContext.currentTokens;
}

export function UseTokenProvider({ children }) {
  const { storedTokens, error, loading } = useStoredTokens()
  const [tokens, setTokens] = useState<Partial<TokenInfo>[]>([]);
  const { poolPromise } = usePool();

  const resolveTokenInfo = (address: string) => {
    let token = tokens.find(({ address: tokenAddress }) => address === tokenAddress);
    if (token) return Promise.resolve(token);

    token = storedTokens.find(({ address: tokenAddress }) => address === tokenAddress);
    if (token) return Promise.resolve(token);

    return poolPromise.then(pool => getTokenInfo(address, pool));
  };

  return (
    <UseTokenContext.Provider
      value={{
        currentTokens: tokens,
        updateTokens: setTokens,
        resolveTokenInfo,
        error,
        loading
      }}
    >
      {children}
    </UseTokenContext.Provider>
  );
}
