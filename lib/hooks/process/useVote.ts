import { usePool } from "@vocdoni/react-hooks";
import { VotingApi } from "dvote-js";
import { useCallback, useEffect, useMemo, useReducer } from "react";
import useSWR from "swr";
import { useWallet } from "use-wallet";
import { getBalanceSlotByBruteForce, getProof, getProofParameters } from "../../api";
import { useSigner } from "../useSigner";

export interface VoteStatus {
  submitting: boolean;
  choices: number[];
  inCensus: boolean;
}

const INITIAL_STATE = {
  submitting: false,
  choices: [],
  inCensus: false,
};

function updateStatus(status: Partial<VoteStatus>) {
  return <const>{
    type: "UPDATE_STATUS",
    status,
  };
}

export type StatusAction = ReturnType<typeof updateStatus>;

export const reducer = (state: VoteStatus, action: StatusAction) => {
  switch (action.type) {
    case "UPDATE_STATUS":
      state = {
        ...state,
        ...action.status,
      };
      return state;
    default:
      return state;
  }
};

export const useVote = (token, process) => {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE);
  const wallet = useWallet();
  const signer = useSigner();
  const { poolPromise } = usePool();

  const nullifier = useMemo(() => {
    if (process?.id) return VotingApi.getSignedVoteNullifier(wallet?.account || "", process.id);
  }, [process?.id]);

  const updateStatus = async (processId) => {
    const pool = await poolPromise;

    const voted = VotingApi.getEnvelopeStatus(processId, nullifier, pool);
    return voted;
  };

  const voteInfo = useSWR([process?.id, nullifier, wallet], updateStatus, {
    isPaused: () => !process?.id,
  });

  useEffect(() => {
    dispatch({ type: "UPDATE_STATUS", status: { choices: [] } });
  }, [process, dispatch]);

  const onSubmitVote = async (token, process, wallet): Promise<void> => {
    try {
      const pool = await poolPromise;
      const params = {
        token: token.address,
        account: wallet.account,
        pool,
      };
      const { block, balance } = await getProofParameters(params);
      const tokenBalancePosition = await getBalanceSlotByBruteForce(params);

      const proofParams = {
        block,
        tokenBalancePosition,
        balance,
        ...params,
      };

      const proof = await getProof(proofParams);
      console.log(proof);
      if (!proof) {
        return;
      }

      // Detect encryption
      const envelopParams = {
        votes: state.choices,
        censusOrigin: process.parameters.censusOrigin,
        censusProof: proof.storageProof[0],
        processId: process.id,
        walletOrSigner: signer,
      };

      if (process.parameters.envelopeType.hasEncryptedVotes) {
        const keys = await VotingApi.getProcessKeys(process.id, pool);
        envelopParams["processKey"] = keys;
      }

      console.log("here");
      const envelope = await VotingApi.packageSignedEnvelope(envelopParams);
      console.log("here");
      await VotingApi.submitEnvelope(envelope, signer, pool);
    } catch (err) {
      console.log("Error in hook useVotes function onSubmitVote: ", err.message);
      throw new Error(err.message);
    } finally {
      updateStatus({
        submitting: false,
      });
    }
  };

  return {
    status: state,
    updateStatus: (status: Partial<VoteStatus>) => dispatch({ type: "UPDATE_STATUS", status }),
    voteInfo,
    vote: onSubmitVote,
  };
};
