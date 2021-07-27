import { usePool } from "@vocdoni/react-hooks";
import { useState, useEffect } from "react";
import { hasBalance } from "../api";

/**
 * Hook that determines whether or not a user holds a particular token.
 *
 * @param userAddress Ethereum wallet address of a user
 * @param tokenAddress ERC-20 Token address to be checked for balance
 * @returns holdbalance Indicates that the userAddress holds the specified tokens.
 *          loading     Indicates that the hook is still evaluating
 *          error       Indicates an error during the data fetching process
 */
export function useUserHoldsToken(userAddress, tokenAddress) {
  const { poolPromise } = usePool();
  const [holdsBalance, setHoldsBalance] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userAddress || !tokenAddress) {
      setLoading(false);
    } else {
      if (!loading) {
        setLoading(true);
        poolPromise
          .then((p) => {
            return hasBalance(tokenAddress, userAddress, p);
          })
          .then((b) => {
            setHoldsBalance(b);
            setLoading(false);
          })
          .catch((error) => {
            setError(error);
          });
      }
    }

    return () => setLoading(false);
  }, [userAddress, tokenAddress]);

  return { holdsBalance, error, loading };
}
