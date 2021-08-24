import { useEffect, useState } from "react";
import { usePool } from "@vocdoni/react-hooks";

import { getRegisteredTokenList } from "../../../lib/api";
import { FetchRegisteredTokensError } from "../../errors";
import { TokenAddress, HookData } from "../../types";

/* NOTE This is currently not used. */

/**
 * Returns a list of all the token addresses that currently registered on the Voice's
 * smart contract.
 *
 * @returns HookData, where the data is a list of token addresses.
 */
export function useRegisteredTokens(): HookData<TokenAddress[]> {
  const { poolPromise, loading } = usePool();

  const [tokenAddresses, setTokenList] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error>(null);

  useEffect(() => {
    async function getTokenList() {
      setIsLoading(true);
      try {
        const pool = await poolPromise;
        const tokens = await getRegisteredTokenList(0, pool);
        setTokenList(tokens);
      } catch (err) {
        setError(new FetchRegisteredTokensError(err));
      } finally {
        setIsLoading(false);
      }
    }
    getTokenList();
  }, [poolPromise]);

  return { data: tokenAddresses, isLoading: isLoading || loading, error };
}
