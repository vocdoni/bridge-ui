import { useEffect, useState } from "react";
import { usePool } from "@vocdoni/react-hooks";

import { getTokenInfo } from "../../api";
import { TokenAddress, TokenInfo } from "../../types";
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
    storedTokens.tokens.find((t) => t.address?.toLowerCase?.() == address?.toLowerCase?.())
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
    addresses.map((addr) => storedTokens.tokens.find((item) => item.address == addr))
  );
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  // Load from IndexDB or resolve it (if new)
  useEffect(() => {
    const uncachedTokens: string[] = [];

    for (let addr of addresses) {
      const included = storedTokens.tokens.some(
        (t) => t.address.toLowerCase() == addr?.toLowerCase?.()
      );
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
