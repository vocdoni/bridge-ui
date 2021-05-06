import { usePool } from "@vocdoni/react-hooks";
import { GatewayPool } from "dvote-js";
import useSWR from "swr";
import { useWallet } from "use-wallet";
import { getProof } from "../../api";
import { TokenInfo } from "../../types";
import { ETH_BLOCK_HEIGHT_PADDING } from "../../constants";

export const useCensusProof = (token: Partial<TokenInfo>, targetBlock?: number) => {
  const { poolPromise } = usePool();
  const wallet = useWallet();

  const fetchProof = async (
    account: string,
    token: Partial<TokenInfo>,
    poolPromise: Promise<GatewayPool>,
    targetBlock?: number
  ) => {
    try {
      const pool = await poolPromise;

      if (!targetBlock) {
        targetBlock = (await pool.provider.getBlockNumber()) - ETH_BLOCK_HEIGHT_PADDING;
      }

      const data = await getProof({
        account,
        token: token.address,
        pool,
        block: targetBlock,
        tokenBalancePosition: token.balanceMappingPosition,
      });
      if (data && "storageProof" in data) return data;
    } catch (e) {
      console.log("Error in useCensusProof: ", e.message);
    }
  };

  const { data } = useSWR([wallet.account, token, poolPromise, targetBlock], fetchProof, {
    isPaused: () => !wallet.account || !token || !poolPromise,
  });

  return data;
};
