import { usePool } from "@vocdoni/react-hooks";
import { GatewayPool } from "dvote-js";
import useSWR from "swr";
import { useWallet } from "use-wallet";
import { getProof } from "../../api";
import { TokenInfo } from "../../types";

export const useCensusProof = (token: Partial<TokenInfo>, block?: number) => {
  const { poolPromise } = usePool();
  const wallet = useWallet();

  const fetchProof = async (
    account: string,
    token: Partial<TokenInfo>,
    poolPromise: GatewayPool
  ) => {
    try {
      const pool = await poolPromise;

      if (!block) {
        block = await pool.provider.getBlockNumber();
      }

      const data = await getProof({
        account,
        token: token.address,
        pool,
        block,
        tokenBalancePosition: token.balanceMappingPosition,
      });
      if (data && "storageProof" in data) return data;
    } catch (e) {
      console.log("Error in useCensusProof: ", e.message);
    }
  };

  const { data } = useSWR([wallet.account, token, poolPromise, process], fetchProof, {
    isPaused: () => !wallet.account || !token || !poolPromise || !process,
  });

  return data;
};
