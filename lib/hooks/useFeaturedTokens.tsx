import { useEffect, useState } from "react";
import { getFeaturedTokens, tokenSorter } from "../tokens";
import { UseData, TokenInfo, TokenAddress } from "../types";
import { useStoredTokens } from "./context/tokens";
import { useEnvironment } from "./context/useEnvironment";

/**
 * This hook gets the list of curated featred tokens addresses for the current network. It
 * then gets the information for those tokens. The output can be returned either sorted
 * (w.r.t the tokens' symbols) or unsorted.
 *
 * @param sorted Indicates whether or not the output should be sorted. Defaults to unsorted.
 * @returns Aray containing token information for curated featured tokens
 */
export function useFeaturedTokens(sorted = false): UseData<TokenInfo[]> {
  const { networkName } = useEnvironment();
  const {
    data: storedTokens,
    isLoading: storedTokensLoading,
    error: storedTokensError,
  } = useStoredTokens();

  const [featuredTokenInfo, setFeaturedTokenInfo] = useState<TokenInfo[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(true);

    //get list of featured tokens
    const featuredTokenAddresses: TokenAddress[] = getFeaturedTokens(networkName);

    //filter stored tokens for featured tokens
    const isFeatured = (ti: TokenInfo) => featuredTokenAddresses.includes(ti.address.toLowerCase());
    const featuredTokenInfo = storedTokens.filter(isFeatured);

    if (sorted) featuredTokenInfo.sort(tokenSorter);

    //set featured tokens
    setFeaturedTokenInfo(featuredTokenInfo);
    setIsLoading(false);
  }, [storedTokens]);

  return {
    data: featuredTokenInfo,
    isLoading: storedTokensLoading || isLoading,
    error: storedTokensError,
  };
}
