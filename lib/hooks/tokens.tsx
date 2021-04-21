import React, { useCallback, useContext, useEffect, useRef, useState } from "react";
import { getTokenInfo } from "../api";
import { TokenInfo } from "../types";
import { usePool } from "@vocdoni/react-hooks";
// import { useLoadingAlert } from './loading-alert'
import { useMessageAlert } from "./message-alert";

const UseTokenContext = React.createContext<{
  currentTokens: Map<string, TokenInfo>;
  resolveTokenInfo: (address: string) => Promise<TokenInfo>;
  refreshTokenInfo: (address: string) => Promise<TokenInfo>;
}>({
  currentTokens: new Map(),
  resolveTokenInfo: () => Promise.reject(new Error("Not initialized")),
  refreshTokenInfo: () => Promise.reject(new Error("Not initialized")),
});

export function useToken(address: string): TokenInfo | null {
  const tokenContext = useContext(UseTokenContext);
  const [tokenInfo, setTokenInfo] = useState<TokenInfo>(null);
  const { setAlertMessage } = useMessageAlert();
  // const { setLoadingMessage, hideLoading } = useLoadingAlert()

  useEffect(() => {
    let ignore = false;

    const update = () => {
      if (!address) return;

      tokenContext
        .resolveTokenInfo(address)
        .then((newInfo) => {
          if (ignore) return;
          setTokenInfo(newInfo);
        })
        .catch((err) => {
          setAlertMessage("The token details could not be loaded");
          console.error(err);
        });
    };
    update();

    return () => {
      ignore = true;
    };
  }, [address]);

  if (tokenContext === null) {
    throw new Error(
      "useToken() can only be used inside of <UseTokenProvider />, " +
        "please declare it at a higher level."
    );
  }

  return tokenInfo;
}

/** Returns an arran containing the available information about the given addresses */
export function useTokens(addresses: string[]) {
  const tokenContext = useContext(UseTokenContext);
  const [bool, setBool] = useState(false); // to force rerender
  // const { pool } = usePool()
  // const { setAlertMessage } = useMessageAlert()

  useEffect(() => {
    if (!addresses || !addresses.length) return;

    // Signal a refresh on the current token addresses
    Promise.all(addresses.map((address) => tokenContext.resolveTokenInfo(address)))
      .then(() => {
        setBool(!bool);
      })
      .catch((err) => {
        // setAlertMessage("Some token details could not be loaded")

        console.error(err);
        setBool(!bool);
      });

    return () => undefined;
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
  // TODO: Use swr

  const tokens = useRef(new Map<string, TokenInfo>());
  const { poolPromise } = usePool();

  const resolveTokenInfo: (address: string) => Promise<TokenInfo> = useCallback(
    (address: string) => {
      if (!address) return Promise.resolve(null);
      else if (tokens.current.has(address.toLowerCase())) {
        // cached
        return Promise.resolve(tokens.current.get(address.toLowerCase()));
      }
      return loadTokenInfo(address);
    },
    []
  );

  const loadTokenInfo: (address: string) => Promise<TokenInfo> = useCallback((address: string) => {
    return poolPromise
      .then((pool) => getTokenInfo(address, pool))
      .then((tokenInfo) => {
        tokens.current.set(address.toLowerCase(), tokenInfo);
        return tokenInfo;
      });
  }, []);

  return (
    <UseTokenContext.Provider
      value={{
        currentTokens: tokens.current,
        resolveTokenInfo,
        refreshTokenInfo: loadTokenInfo,
      }}
    >
      {children}
    </UseTokenContext.Provider>
  );
}
