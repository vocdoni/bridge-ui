import { usePool } from "@vocdoni/react-hooks";
import { useEffect, useState } from "react";
import { useWallet } from "use-wallet";
import { getProof, CensusProof } from "../../api";
import { TokenInfo } from "../../types";

export const useCensusProof = (token: Partial<TokenInfo>, targetBlock: number) => {
  const { poolPromise } = usePool();
  const [proof, setProof] = useState<CensusProof>();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const wallet = useWallet();

  const account = wallet?.account;
  const tokenAddr = token?.address;
  const balanceMappingPosition = token?.balanceMappingPosition;

  useEffect(() => {
    if (!account || !tokenAddr || !targetBlock) {
      if (loading) setLoading(false);
      return;
    }

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

        if (err?.message == "You have no token balance") return
        setError("Could not fetch the census proof");
      });

  }, [account, tokenAddr, balanceMappingPosition, poolPromise, targetBlock])

  return { proof, error, loading };
};
