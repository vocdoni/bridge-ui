import { usePool } from "@vocdoni/react-hooks";
import { GatewayPool } from "dvote-js";
import useSWR from "swr";
import { useWallet } from "use-wallet";
import { getBalanceSlotByBruteForce, getProof, getProofParameters } from "../../api";
import { TokenInfo } from "../../types";

export const useCensusProof = (token: Partial<TokenInfo>) => {
  const { poolPromise } = usePool();
  const wallet = useWallet();

  const fetchProof = async (account: string, token: string, poolPromise: GatewayPool) => {
    try {
      const pool = await poolPromise;
      const params = { account, token, pool };
      const { block, balance } = await getProofParameters(params);
      const tokenBalancePosition = await getBalanceSlotByBruteForce(params);

      const proofParams = {
        tokenBalancePosition,
        block,
        balance,
        ...params,
      };

      const proof = await getProof(proofParams);

      return proof;
    } catch (e) {
      console.log("Error: ", e.message);
    }
  };

  const { data } = useSWR([wallet.account, token?.address, poolPromise], fetchProof, {
    isPaused: () => !wallet.account || !token?.address || !poolPromise,
    refreshInterval: 20000,
  });

  return data;
};
