import { usePool } from "@vocdoni/react-hooks";
import { IProcessDetails, SignedEnvelopeParams, VotingApi } from "dvote-js";
import { useEffect, useMemo, useReducer, useState } from "react";
import { useWallet } from "use-wallet";
import { CensusProof } from "../../api";
import { useMessageAlert } from "../message-alert";
import { useSigner } from "../useSigner";

export interface VoteState {
  submitting: boolean;
  choices: number[];
  submitted: boolean;
}

export interface VotingStatus {
  registered: boolean;
  date?: Date;
  block?: number;
}

const INITIAL_STATE = {
  submitting: false,
  choices: [],
  submitted: false,
};

function setState(state: Partial<VoteState>) {
  return <const>{
    type: "SET_STATE",
    state,
  };
}

export type StatusAction = ReturnType<typeof setState>;

// Q: Is a reducer needed, just for this?
export const voteStateReducer = (state: VoteState, action: StatusAction) => {
  switch (action.type) {
    case "SET_STATE":
      return {
        ...state,
        ...action.state,
      };
    default:
      return state;
  }
};

export const useVote = (processDetails: IProcessDetails) => {
  const [voteState, dispatch] = useReducer(voteStateReducer, INITIAL_STATE);
  const wallet = useWallet();
  const signer = useSigner();
  const { poolPromise } = usePool();
  const { setAlertMessage } = useMessageAlert();
  const [votingStatus, setVotingStatus] = useState<VotingStatus>();

  const processId = processDetails?.id || "";
  const voterAddress = wallet?.account || "";

  const nullifier = useMemo(() => {
    if (processId) return VotingApi.getSignedVoteNullifier(voterAddress, processId);
  }, [processId, voterAddress]);

  // Auto refresh vote status
  useEffect(() => {
    const interval = setInterval(() => refreshVotingStatus(), 1000 * 20);
    refreshVotingStatus().then((votingStatus) => {
      // No need to keep updating if already voted
      if (votingStatus?.registered) clearInterval(interval);
    });

    return clearInterval(interval);
  }, [processId, voterAddress]);

  // Clear choices on dependency change
  useEffect(() => {
    dispatch({ type: "SET_STATE", state: { choices: [] } });
  }, [processId, dispatch, voterAddress]);

  // Callbacks

  const refreshVotingStatus = () => {
    if (!nullifier) return Promise.resolve(null);

    return poolPromise
      .then((pool) => VotingApi.getEnvelopeStatus(processId, nullifier, pool))
      .then((votingStatus) => {
        setVotingStatus(votingStatus);
        return votingStatus;
      });
  };

  const submitVote = async (processDetails: IProcessDetails, proof: CensusProof): Promise<void> => {
    try {
      dispatch({ type: "SET_STATE", state: { submitting: true } });
      const pool = await poolPromise;

      // Detect encryption
      const envelopParams: SignedEnvelopeParams = {
        votes: voteState.choices,
        censusOrigin: processDetails.state.censusOrigin,
        censusProof: proof.storageProof[0],
        processId: processId,
        walletOrSigner: signer,
      };

      if (processDetails.state.envelopeType.encryptedVotes) {
        envelopParams.processKeys = await VotingApi.getProcessKeys(processId, pool);
      }

      const envelope = await VotingApi.packageSignedEnvelope(envelopParams);
      await VotingApi.submitEnvelope(envelope, signer, pool);

      // // loop until the vote is registered
      // let voted = false
      // for (let i = 0; i < 60; i++) {
      //   const { registered, date } = await VotingApi.getEnvelopeStatus(
      //     processId,
      //     nullifier,
      //     pool
      //   )
      //   if (registered) {
      //     voted = true
      //     break
      //   }
      //   // keep waiting
      //   await new Promise(res => setTimeout(res, 1000 * 3))
      // }
      // if (!voted) throw new Error("The vote has not been registered yet")

      dispatch({ type: "SET_STATE", state: { submitted: true } });
      setAlertMessage("Vote successful :-)", "success");
    } catch (err) {
      console.error("Error in hook useVotes function submitVote: ", err.message);
      throw err;
    } finally {
      dispatch({ type: "SET_STATE", state: { submitting: false } });
    }
  };

  return {
    voteState,
    setState: (state: Partial<VoteState>) => dispatch({ type: "SET_STATE", state }),
    votingStatus,
    refreshVotingStatus,
    submitVote,
  };
};
