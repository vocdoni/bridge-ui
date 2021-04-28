import React, { useCallback, useContext, useEffect, useState } from "react";
import { usePool } from "@vocdoni/react-hooks";

import { getTokenInfo } from "../../api";
import { TokenInfo } from "../../types";
import { useMessageAlert } from "./../message-alert";
import useLocalStorage from "../useLocalStorage";
import useSWR from "swr";

const UseTokenContext = React.createContext<{
  currentTokens: Partial<TokenInfo>[];
  updateTokens: (value: TokenInfo[]) => void;
  resolveTokenInfo: (address: string) => Promise<Partial<TokenInfo>>;
  refreshTokenInfo: (address: string) => Promise<TokenInfo>;
}>({
  currentTokens: new Array(),
  updateTokens: () => undefined,
  resolveTokenInfo: () => Promise.reject(new Error("Not initialized")),
  refreshTokenInfo: () => Promise.reject(new Error("Not initialized")),
});

export function useToken(address: string): Partial<TokenInfo> | null {
  const tokenContext = useContext(UseTokenContext);
  const { setAlertMessage } = useMessageAlert();
  // const { setLoadingMessage, hideLoading } = useLoadingAlert()

  const fetchToken = async () => {
    try {
      const newInfo = await tokenContext.resolveTokenInfo(address);
      return newInfo;
    } catch (error) {
      setAlertMessage("The token details could not be loaded");
      console.error(error);
    }
  };

  const { data } = useSWR([address], fetchToken, {
    isPaused: () => !address,
  });

  if (tokenContext === null) {
    throw new Error(
      "useToken() can only be used inside of <UseTokenProvider />, " +
        "please declare it at a higher level."
    );
  }

  return data;
}

/** Returns an array containing the available information about the given addresses */
export function useTokens(addresses: string[]) {
  const tokenContext = useContext(UseTokenContext);
  // const { setAlertMessage } = useMessageAlert()

  const fetchTokensInfo = async (addresses: string[]) => {
    // @TODO: Add multicall + fetch of token information
    const fetchPromises = addresses.map((a) => tokenContext.refreshTokenInfo(a));
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

const EXISTING_TOKENS: Partial<TokenInfo>[] = [
  {
    name: "DAI",
    symbol: "DAI",
    address: "0xca0ea2002a4177f9eb1822092ee0b4c183d91bba",
    totalSupplyFormatted: "10.00",
  },
];

export function UseTokenProvider({ children }) {
  const [tokens, setTokens] = useLocalStorage("voting:tokens", EXISTING_TOKENS);

  const { poolPromise } = usePool();

  const resolveTokenInfo = useCallback(
    async (address: string) => {
      // @TODO: Add validation address is correct
      const tokenCached = tokens.find(({ address: tokenAddress }) => address === tokenAddress);

      if (tokenCached) return tokenCached;
      return loadTokenInfo(address);
    },
    [tokens]
  );

  const loadTokenInfo: (address: string) => Promise<TokenInfo> = useCallback(
    async (address: string) => {
      const pool = await poolPromise;
      const token = await getTokenInfo(address, pool);
      return token;
    },
    [poolPromise]
  );

  return (
    <UseTokenContext.Provider
      value={{
        currentTokens: tokens,
        updateTokens: setTokens,
        resolveTokenInfo,
        refreshTokenInfo: loadTokenInfo,
      }}
    >
      {children}
    </UseTokenContext.Provider>
  );
}
