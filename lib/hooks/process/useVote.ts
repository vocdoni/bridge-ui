import { usePool } from "@vocdoni/react-hooks";
import { CensusErc20Api, VotingApi } from "dvote-js";
import { providers } from "ethers";
import { useCallback, useReducer } from "react";
import useSWR from "swr";
import { useWallet } from "use-wallet";
import { useSigner } from "../useSigner";

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

export const useVote = (token, process, nullifier) => {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE);
  const wallet = useWallet();
  const signer = useSigner();
  const { poolPromise } = usePool();

  const updateStatus = async (process) => {
    const pool = await poolPromise;
    const voted = VotingApi.getEnvelopeStatus(process.id, nullifier, pool);
    return voted;
  };

  const voteInfo = useSWR([process, nullifier, wallet], updateStatus, {
    isPaused: () => !process,
  });

  const onSubmitVote = useCallback(async (): Promise<void> => {
    const holderAddr = wallet.account;
    const balanceSlot = CensusErc20Api.getHolderBalanceSlot(holderAddr, 0);
    updateStatus({
      submitting: true,
    });
    try {
      const pool = await poolPromise;
      // Census Proof
      const processEthCreationBlock = await pool.provider.getBlockNumber();
      const { proof } = await CensusErc20Api.generateProof(
        token.address,
        [balanceSlot],
        processEthCreationBlock - 1,
        pool.provider as providers.JsonRpcProvider
      );

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

      const envelope = await VotingApi.packageSignedEnvelope(envelopParams);
      await VotingApi.submitEnvelope(envelope, signer, pool);
    } catch (err) {
      console.log("Error in hook useVotes function onSubmitVote: ", err.message);
      throw new Error(err.message);
    } finally {
      updateStatus({
        submitting: false,
      });
    }
  }, [token, process, wallet]);

  return {
    status: state,
    updateStatus: (status: Partial<VoteStatus>) => dispatch({ type: "UPDATE_STATUS", status }),
    voteInfo,
    vote: onSubmitVote,
  };
};
