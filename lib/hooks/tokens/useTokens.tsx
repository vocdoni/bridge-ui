import { useEffect, useState } from "react";
import { usePool } from "@vocdoni/react-hooks";

import { getTokenInfo } from "../../api";
import { TokenInfo } from "../../types";
// import { useMessageAlert } from "./../message-alert";
import { useStoredTokens } from "./useStoredTokens";
import { GatewayPool } from "dvote-js";

/** Frontend of the cached token list */
export function useToken(address: string) {
  const { poolPromise } = usePool();
  const { storedTokens, storeTokens, error: tokenListError, loading: tokenListLoading } = useStoredTokens();
  const [tokenInfo, setTokenInfo] = useState<TokenInfo>(() => storedTokens.find(t => t.address?.toLowerCase?.() == address?.toLowerCase?.()));
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  // Load from IndexDB or resolve it (if new)
  useEffect(() => {
    if (tokenInfo?.address?.toLowerCase?.() == address?.toLowerCase?.()) return; // done

    setLoading(true);

    poolPromise
      .then(pool => getTokenInfo(address, pool))
      .then(tokenInfo => {
        setLoading(false);
        setError("");

        setTokenInfo(tokenInfo);
        return storeTokens([tokenInfo]); // DB sync
      })
      .catch(err => {
        setLoading(false);
        setError(err?.message);
      })
  }, [address]);

  return { tokenInfo, error: error || tokenListError, loading: loading || tokenListLoading };
}

/** Frontend of the cached token list */
export function useTokens(tokenAddresses: string[]) {
  const { poolPromise } = usePool();
  const { storedTokens, storeTokens, error: tokenListError, loading: tokenListLoading } = useStoredTokens();
  const [tokenInfoList, setTokenInfoList] = useState<TokenInfo[]>(() => tokenAddresses.map(addr => storedTokens.find(item => item.address == addr)));
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string>("")

  // Load from IndexDB or resolve it (if new)
  useEffect(() => {
    const uncachedTokens: string[] = [];

    for (let addr of tokenAddresses) {
      const included = storedTokens.some(t => t.address.toLowerCase() == addr?.toLowerCase?.());
      if (included) continue;

      uncachedTokens.push(addr);
    }

    let pool: GatewayPool
    poolPromise
      .then(gwPool => {
        pool = gwPool;

        return Promise.all(uncachedTokens.map(tokenAddr => getTokenInfo(tokenAddr, pool)))
      })
      .then(newTokenInfos => {
        setLoading(false);
        setError("");

        // Set the full list following the original token address order
        const combinedTokenList = [].concat(storedTokens).concat(newTokenInfos) as TokenInfo[];
        const result = tokenAddresses.map(addr => combinedTokenList.find(item => item.address == addr));

        setTokenInfoList(result);
        // Store the uncached ones
        return storeTokens(newTokenInfos);
      })
      .catch(err => {
        setLoading(false);
        setError(err?.message);
      })
  }, [tokenAddresses]);

  return { tokenInfoList, error: error || tokenListError, loading: loading || tokenListLoading };
}
