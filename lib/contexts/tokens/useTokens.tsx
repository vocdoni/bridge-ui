import { useEffect, useState } from "react";
import { GatewayPool } from "dvote-js";
import { usePool } from "@vocdoni/react-hooks";

import { getTokenInfo } from "../../api";
import { TokenAddress, TokenInfo, UseData } from "../../types";
import { FetchTokensInfosError } from "../../errors";
import { useStoredTokens } from "./useStoredTokens";

/**
 * This hook returns information about a specific token. If the info is found in cache, it
 * will immediately return that information. Otherwise, it will first fetch it from the
 * web and store it in cache, before returning it.
 *
 * @param address Address of token for which information should be returned
 * @returns Information about the token
 */
export function useToken(address: TokenAddress) {
  const { poolPromise } = usePool();
  const {
    data: storedTokens,
    storeTokens,
    error: tokenListError,
    isLoading: tokenListLoading,
  } = useStoredTokens();
  const [tokenInfo, setTokenInfo] = useState<TokenInfo>(() =>
    storedTokens.find((t) => t.address?.toLowerCase?.() == address?.toLowerCase?.())
  );
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  // Load from IndexDB or resolve it (if new)
  useEffect(() => {
    if (tokenInfo?.address?.toLowerCase?.() == address?.toLowerCase?.()) return; // done

    setLoading(true);

    poolPromise
      .then((pool) => getTokenInfo(address, pool))
      .then((tokenInfo) => {
        setLoading(false);
        setError("");

        setTokenInfo(tokenInfo);
        return storeTokens([tokenInfo]); // DB sync
      })
      .catch((err) => {
        setLoading(false);
        setError(err?.message);
      });
  }, [address, poolPromise]);

  return { tokenInfo, error: error || tokenListError, loading: loading || tokenListLoading };
}

/*  NOTE NOT CURRENTLY USED */
/**
 * This hook returns information about a list of tokens. If the infos are found in cache, it
 * will immediately return the information. Otherwise, it will first fetch it from the
 * web and store it in cache, before returning it.
 *
 * @param addresses List of addresses of token for which information should be returned
 * @returns Information about the tokens
 */
export function useTokens(addresses: TokenAddress[]) {
  const { poolPromise } = usePool();
  const {
    data: storedTokens,
    storeTokens,
    error: tokenListError,
    isLoading: tokenListLoading,
  } = useStoredTokens();
  const [tokenInfoList, setTokenInfoList] = useState<TokenInfo[]>(() =>
    addresses.map((addr) => storedTokens.find((item) => item.address == addr))
  );
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  // Load from IndexDB or resolve it (if new)
  useEffect(() => {
    const uncachedTokens: string[] = [];

    for (let addr of addresses) {
      const included = storedTokens.some((t) => t.address.toLowerCase() == addr?.toLowerCase?.());
      if (included) continue;

      uncachedTokens.push(addr);
    }

    poolPromise
      .then((gwPool) => {
        return Promise.all(uncachedTokens.map((tokenAddr) => getTokenInfo(tokenAddr, gwPool)));
      })
      .then((newTokenInfos) => {
        setLoading(false);
        setError("");

        // Set the full list following the original token address order
        const combinedTokenList = [].concat(storedTokens).concat(newTokenInfos) as TokenInfo[];
        const result = addresses.map((addr) =>
          combinedTokenList.find((item) => item.address == addr)
        );

        setTokenInfoList(result);
        // Store the uncached ones
        return storeTokens(newTokenInfos);
      })
      .catch((err) => {
        setLoading(false);
        setError(err?.message);
      });
  }, [addresses, poolPromise]);

  return { tokenInfoList, error: error || tokenListError, loading: loading || tokenListLoading };
}

/*  NOTE NOT CURRENTLY USED */
/**
 * This hook returns information about a list of tokens. The infos are fetched solely from the
 * web. I.e., no information is read/stored to/from local storage.
 *
 * @param addresses List of addresses of token for which information should be returned
 * @returns Information about the tokens
 */
export function useTokensWeb3Only(addresses: TokenAddress[]): UseData<TokenInfo[]> {
  const { poolPromise } = usePool();

  const [tokenInfoList, setTokenInfoList] = useState<TokenInfo[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error>(null);

  // Load from IndexDB or resolve it (if new)
  useEffect(() => {
    async function fetchTokenInfos() {
      if (!addresses) {
        setTokenInfoList([]);
        return;
      }

      setIsLoading(true);
      try {
        const pool = await poolPromise;
        const tokenInfos = await Promise.all(addresses.map((ta) => getTokenInfo(ta, pool)));
        setTokenInfoList(tokenInfos);
      } catch (err) {
        setError(new FetchTokensInfosError(err));
      } finally {
        setIsLoading(false);
      }
    }

    fetchTokenInfos();
  }, [addresses, poolPromise]);

  return { data: tokenInfoList, isLoading, error: error };
}
