import { usePool } from "@vocdoni/react-hooks";
import { useEffect, useState } from "react";
import { getProof, CensusProof } from "../../api";
import { TokenInfo } from "../../types";
import { useSigner } from "../useSigner";

export const useCensusProof = (token: Partial<TokenInfo>, targetBlock: number) => {
  const { poolPromise } = usePool();
  const [proof, setProof] = useState<CensusProof>();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const { address: holderAddress } = useSigner();

  const tokenAddr = token?.address;
  const balanceMappingPosition = token?.balanceMappingPosition;

  useEffect(() => {
    if (!holderAddress || !tokenAddr || !targetBlock) {
      if (loading) setLoading(false);
      return;
    }

    setLoading(true);

    /* TODO should not have "no balance" as an error, but as an additional state. */
    poolPromise
      .then((pool: any) =>
        getProof({
          account: holderAddress,
          token: tokenAddr,
          block: targetBlock,
          balanceMappingPosition,
          pool,
        })
      )
      .then((data) => {
        setLoading(false);

        if (data?.storageProof) setProof(data as any);
        else setError("You are not a token holder");
      })
      .catch((err) => {
        setLoading(false);

        if (err?.message == "You have no token balance") return;
        setError("Could not fetch the census proof");
      });
  }, [holderAddress, tokenAddr, balanceMappingPosition, poolPromise, targetBlock]);

  return { proof, error, loading };
};
