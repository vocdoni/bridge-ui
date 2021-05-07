import { usePool } from "@vocdoni/react-hooks";
import { GatewayPool } from "dvote-js";
import useSWR from "swr";
import { useWallet } from "use-wallet";
import { getProof } from "../../api";
import { TokenInfo } from "../../types";

export const useCensusProof = (token: Partial<TokenInfo>, targetBlock: number) => {
  const { poolPromise } = usePool();
  const wallet = useWallet();

  const { data, error } = useSWR([wallet?.account, token?.address, token?.balanceMappingPosition, poolPromise, targetBlock], fetchProof, {
    isPaused: () => !(wallet?.account) || !(token?.address),
  });

  return { proof: data, error };
};

const fetchProof = async (
  account: string,
  tokenAddress: string,
  balanceMappingPosition: number,
  poolPromise: Promise<GatewayPool>,
  targetBlock: number
) => {
  return poolPromise
    .then(pool => getProof({
      account,
      token: tokenAddress,
      block: targetBlock,
      balanceMappingPosition,
      pool,
    }))
    .then(data => {
      if (data && "storageProof" in data) return data;
      return null;
    });
};
