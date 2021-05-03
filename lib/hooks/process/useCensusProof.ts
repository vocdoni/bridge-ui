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
      console.log("These are the params: ", params);
      const { block, balance } = await getProofParameters(params);
      console.log("this is the block: ", block);
      console.log("this is the balance: ", balance);
      const tokenBalancePosition = await getBalanceSlotByBruteForce(params);
      console.log("token balance position: ", tokenBalancePosition);

      const proofParams = {
        tokenBalancePosition,
        block,
        balance,
        ...params,
      };

      console.log("before getting proof: ");
      const proof = await getProof(proofParams);
      console.log(proof);
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
