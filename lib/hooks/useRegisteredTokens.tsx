import { useEffect, useState } from "react";
import { usePool } from "@vocdoni/react-hooks";

import { getRegisteredTokenList } from "../../lib/api";
import { FetchRegisteredTokensError } from "../errors";
import { TokenAddress, UseData } from "../types";

/* NOTE This is currently not used. */

/**
 * Returns a list of all the token addresses that currently registered on the Voice's
 * smart contract.
 *
 * @returns UseData, where the data is a list of token addresses.
 */
export function useRegisteredTokens(): UseData<TokenAddress[]> {
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

// export function useRegisteredTokenAddresses(networkId) {
//   const { poolPromise, loading } = usePool();
//   const [tokenAddresses, setTokenList] = useState<string[]>([]);
//   const [isLoading, setIsLoading] = useState(false);
//   const [error, setError] = useState<Error>(null);

//   useEffect(() => {
//     console.log("NETWORK CHANGE DETCTED IN REGISTER TOKENS");
//     async function getTokenList() {
//       setIsLoading(true);
//       try {
//         const pool = await poolPromise;
//         console.log("REG TOKEN chainId: " + (await pool.chainId));
//         console.log("REG TOKEN dvoteUri: " + (await pool.dvoteUri));
//         const tokens = await getRegisteredTokenList(0, pool);
//         setTokenList(tokens);
//       } catch (err) {
//         setError(new FetchRegisteredTokensError(err));
//       } finally {
//         setIsLoading(false);
//       }
//     }

//     while (loading) {
//       console.log("waiting");
//     }
//     getTokenList();
//   }, [networkId]);

//   return { tokenAddresses, isLoading, error };
// }

// export function useRegisteredTokenAddressesMod(poolPromise) {
//   const [tokenAddresses, setTokenList] = useState<string[]>([]);
//   const [isLoading, setIsLoading] = useState(false);
//   const [error, setError] = useState<Error>(null);

//   useEffect(() => {
//     console.log("NETWORK CHANGE DETCTED IN REGISTER TOKENS");
//     async function getTokenList() {
//       setIsLoading(true);
//       try {
//         const pool = await poolPromise;
//         console.log("REG TOKEN chainId: " + (await pool.chainId));
//         console.log("REG TOKEN dvoteUri: " + (await pool.dvoteUri));
//         const tokens = await getRegisteredTokenList(0, pool);
//         setTokenList(tokens);
//       } catch (err) {
//         setError(new FetchRegisteredTokensError(err));
//       } finally {
//         setIsLoading(false);
//       }
//     }
//     getTokenList();
//   }, [poolPromise]);

//   return { tokenAddresses, isLoading, error };
// }
