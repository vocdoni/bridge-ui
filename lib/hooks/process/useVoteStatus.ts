import { usePool } from "@vocdoni/react-hooks";
import { VotingApi } from "dvote-js";
import { useEffect, useReducer } from "react";
import useSWR from "swr";
import { useWallet } from "use-wallet";

export interface VoteStatus {
  submitting: boolean;
  choices: number[];
}

const INITIAL_STATE = {
  submitting: false,
  choices: [],
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
        ...action.status,
        ...state,
      };
      return state;
    default:
      return state;
  }
};

export const useVoteStatus = (processId, nullifier) => {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE);
  const wallet = useWallet();
  const { poolPromise } = usePool();

  const updateStatus = async (processId) => {
    const pool = await poolPromise;
    const voted = VotingApi.getEnvelopeStatus(processId, nullifier, pool);
    return voted;
  };

  const vote = useSWR([processId, nullifier, wallet], updateStatus, {
    isPaused: () => !processId,
  });

  return {
    status: state,
    updateStatus: (status: Partial<VoteStatus>) => dispatch({ type: "UPDATE_STATUS", status }),
    vote,
  };
};
