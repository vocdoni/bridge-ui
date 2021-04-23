import React, {
  Dispatch,
  SetStateAction,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { usePool } from "@vocdoni/react-hooks";
import useSWR from "swr";

import { getTokenInfo } from "../../api";
import { TokenInfo } from "../../types";
// import { useLoadingAlert } from './loading-alert'
import { useMessageAlert } from "./../message-alert";
import useLocalStorage from "../useLocalStorage";

const UseTokenContext = React.createContext<{
  currentTokens: Partial<TokenInfo>[];
  updateTokens: Dispatch<SetStateAction<Partial<TokenInfo[]>>>;
  resolveTokenInfo: (address: string) => Promise<Partial<TokenInfo>>;
  refreshTokenInfo: (address: string) => Promise<TokenInfo>;
}>({
  currentTokens: new Array(),
  updateTokens: () => undefined,
  resolveTokenInfo: () => Promise.reject(new Error("Not initialized")),
  refreshTokenInfo: () => Promise.reject(new Error("Not initialized")),
});

export function useToken(address: string): TokenInfo | null {
  const tokenContext = useContext(UseTokenContext);
  const [tokenInfo, setTokenInfo] = useState(null);
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
  const [_, updateCache] = useLocalStorage("voting:tokens", EXISTING_TOKENS);
  const tokenContext = useContext(UseTokenContext);
  // const { setAlertMessage } = useMessageAlert()

  const fetchTokensInfo = async () => {
    console.log("in fetch tokens info");
    console.log("these are the addesses", addresses);
    // @TODO: Add multicall + fetch of token information
    const fetchPromises = addresses.map((a) => tokenContext.refreshTokenInfo(a));
    console.log("before the promis");
    const allTokensInfo = await Promise.all(fetchPromises);
    console.log("after the promis");
    updateCache(allTokensInfo);
    console.log("in fetch tokens info: ", allTokensInfo);
    return allTokensInfo;
    // updateCache(allTokensInfo);
  };

  const { data } = useSWR("fetchTokensInfo", fetchTokensInfo, {
    refreshInterval: 0,
    isPaused: () => !!addresses
  });

  console.log("data outside  ", data);
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
    name: "Test",
    symbol: "Test",
    address: "0xca0ea2002a4177f9eb1822092ee0b4c183d91bba",
    totalSupplyFormatted: "10.00",
    icon: "test.png",
  },
];

export function UseTokenProvider({ children }) {
  const [cache, updateCache] = useLocalStorage("voting:tokens", EXISTING_TOKENS);
  const [tokens, setTokens] = useState(cache);

  const { poolPromise } = usePool();

  const resolveTokenInfo = useCallback(
    async (address: string) => {
      // @TODO: Add validation address is correct
      const tokenCached = cache.find(({ address: tokenAddress }) => address === tokenAddress);
      if (tokenCached) {
        return tokenCached;
      }
      return loadTokenInfo(address);
    },
    [cache]
  );

  const loadTokenInfo: (address: string) => Promise<TokenInfo> = useCallback(
    async (address: string) => {
      const pool = await poolPromise;
      const token = await getTokenInfo(address, pool);
      return token;
    },
    [poolPromise]
  );

  useEffect(() => {
    if (tokens.length !== cache.length) {
      updateCache(tokens);
    }
  }, [tokens]);

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
