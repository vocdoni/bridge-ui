import { usePool } from "@vocdoni/react-hooks";
import { useEffect, useState } from "react";
import { getTokenInfo } from "../api";
import { TokenAddress, TokenInfo, UseData } from "../types";

/* NOTE This is currently not used. */

export function useTokenSrc(address: TokenAddress): UseData<TokenInfo> {
  const { poolPromise } = usePool();
  const [currQuery, setCurrQuery] = useState("");
  const [isJobPending, setIsJobPending] = useState(true);
  const [tokenInfo, setTokenInfo] = useState<TokenInfo>();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error>(null);

  useEffect(() => {
    setCurrQuery(address);
    setIsJobPending(true);
  }, [address]);

  useEffect(() => {
    async function getTokenInfoWrapper() {
      try {
        const pool = await poolPromise;
        const newTokenInfo = await getTokenInfo(currQuery, pool);
        setTokenInfo(newTokenInfo);
      } catch (error) {
        console.error("There was an error when loading token info");
        setError(new Error(error));
      }
    }

    if (isJobPending) {
      getTokenInfoWrapper();
      setIsJobPending(false);
    }
  }, [poolPromise]);

  /*  TODO correctly set loading */
  return { data: tokenInfo, isLoading, error };
}

/*  TODO implement */
// export function useTokensSrc(addresses: string[]) {
//   const { poolPromise } = usePool();
//   const [tokensInfo, setTokensInfo] = useState<TokenInfo[]>();
//   const [loading, setLoading] = useState<boolean>(false);
//   const [error, setError] = useState<string>("");

//   useEffect(() => {});
// }
