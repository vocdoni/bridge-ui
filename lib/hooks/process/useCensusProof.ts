import { usePool } from "@vocdoni/react-hooks";
import { GatewayPool } from "dvote-js";
import useSWR from "swr";
import { useWallet } from "use-wallet";
import { getProofByBruteForce } from "../../api";
import { TokenInfo } from "../../types";

export const useCensusProof = (token: Partial<TokenInfo>) => {
  const { poolPromise } = usePool();
  const wallet = useWallet();

  const fetchProof = async (account: string, token: string, poolPromise: GatewayPool) => {
    try {
      const pool = await poolPromise;
      const data = await getProofByBruteForce({ account, token, pool });
      console.log(data);
      if ("proof" in data) return data.proof;
    } catch (e) {
      console.log("Error in useCensusProof: ", e.message);
    }
  };

  const { data } = useSWR([wallet.account, token?.address, poolPromise], fetchProof, {
    isPaused: () => !wallet.account || !token?.address || !poolPromise,
    refreshInterval: 20000,
  });

  return data;
};
