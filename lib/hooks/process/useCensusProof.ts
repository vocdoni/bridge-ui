import { usePool } from "@vocdoni/react-hooks";
import { useEffect, useState } from "react";
import { useWallet } from "use-wallet";
import { getProof, StorageProof } from "../../api";
import { TokenInfo } from "../../types";

export const useCensusProof = (token: Partial<TokenInfo>, targetBlock: number) => {
  const { poolPromise } = usePool();
  const [proof, setProof] = useState<StorageProof>();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const wallet = useWallet();

  useEffect(() => {
    const account = wallet?.account;
    const tokenAddr = token?.address;
    const balanceMappingPosition = token?.balanceMappingPosition?.toNumber?.();

    if (!account || !tokenAddr || !targetBlock) return;

    setLoading(true);

    poolPromise
      .then(pool => getProof({
        account,
        token: tokenAddr,
        block: targetBlock,
        balanceMappingPosition,
        pool,
      }))
      .then(data => {
        setLoading(false);

        if (data?.storageProof) setProof(data as any);
        else setError("You are not a token holder");
      })
      .catch(err => {
        setLoading(false);

        setError("Could not fetch the census proof");
      });

  }, [wallet?.account, token?.address, token?.balanceMappingPosition?.toNumber?.(), poolPromise, targetBlock])

  return { proof, error, loading };
};
