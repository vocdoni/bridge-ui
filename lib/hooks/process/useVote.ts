import { ProcessInfo, usePool } from "@vocdoni/react-hooks";
import { VotingApi } from "dvote-js";
import { useEffect, useMemo, useReducer } from "react";
import useSWR from "swr";
import { useWallet } from "use-wallet";
import { useMessageAlert } from "../message-alert";
import { useSigner } from "../useSigner";

export interface VoteStatus {
  submitting: boolean;
  choices: number[];
  registered: boolean;
}

export interface VoteInfo {
  registered: boolean;
  date?: Date;
  block?: number;
}

const INITIAL_STATE = {
  submitting: false,
  choices: [],
  registered: false,
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
      state;
    default:
      return state;
  }
};

export const useVote = (process: ProcessInfo) => {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE);
  const wallet = useWallet();
  const signer = useSigner();
  const { poolPromise } = usePool();
  const { setAlertMessage } = useMessageAlert();

  const nullifier = useMemo(() => {
    if (process?.id) return VotingApi.getSignedVoteNullifier(wallet?.account || "", process.id);
  }, [process?.id, wallet?.account]);

  const updateVoteInfo = async (processId): Promise<VoteInfo> => {
    const pool = await poolPromise;

    const voted = await VotingApi.getEnvelopeStatus(processId, nullifier, pool);
    return voted;
  };

  const voteInfo = useSWR([process?.id, nullifier], updateVoteInfo, {
    isPaused: () => !process?.id || !wallet.account,
  });

  useEffect(() => {
    dispatch({ type: "UPDATE_STATUS", status: { choices: [] } });
  }, [process, dispatch, wallet?.account]);

  const onSubmitVote = async (process, proof): Promise<void> => {
    try {
      dispatch({ type: "UPDATE_STATUS", status: { submitting: true } });
      const pool = await poolPromise;

      // Detect encryption
      const envelopParams = {
        votes: state.choices,
        censusOrigin: process?.parameters.censusOrigin,
        censusProof: proof.storageProof[0],
        processId: process.id,
        walletOrSigner: signer,
      };

      if (process.parameters.envelopeType.hasEncryptedVotes) {
        const keys = await VotingApi.getProcessKeys(process.id, pool);
        envelopParams["processKeys"] = keys;
      }

      const envelope = await VotingApi.packageSignedEnvelope(envelopParams);
      await VotingApi.submitEnvelope(envelope, signer, pool);
      dispatch({ type: "UPDATE_STATUS", status: { registered: true } });
      setAlertMessage("Vote successful :-)", "success");
    } catch (err) {
      console.log("Error in hook useVotes function onSubmitVote: ", err.message);
      throw new Error(err.message);
    } finally {
      dispatch({ type: "UPDATE_STATUS", status: { submitting: false } });
    }
  };

  return {
    status: state,
    updateStatus: (status: Partial<VoteStatus>) => dispatch({ type: "UPDATE_STATUS", status }),
    voteInfo,
    vote: onSubmitVote,
  };
};
