import { useEffect, useState } from "react";
import { usePool } from "@vocdoni/react-hooks";

import { getRegisteredTokenList } from "../../api";
import { UseData } from "../../types";
import { FetchRegisteredTokensError } from "../../errors";

/**
 *
 * @returns List of registered addresses, a loading indicator and an error (or null, if
 * there is none).
 */
export function useRegisteredTokenAddresses(): UseData<string[]> {
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
  }, []);

  return { data: tokenAddresses, isLoading: isLoading || loading, error };
}
