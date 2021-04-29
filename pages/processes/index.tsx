import React, { useState, useEffect } from "react";
import { VotingApi, CensusErc20Api } from "dvote-js";
import { withRouter, useRouter } from "next/router";
import Spinner from "react-svg-spinner";
import { usePool, useProcess } from "@vocdoni/react-hooks";
import { BigNumber, providers } from "ethers";
import { useWallet } from "use-wallet";
import { useUrlHash } from "use-url-hash";

import { strDateDiff } from "../../lib/date";
import { HEX_REGEX } from "../../lib/regex";
import { areAllNumbers } from "../../lib/utils";
import { useToken } from "../../lib/hooks/tokens";
import { useMessageAlert } from "../../lib/hooks/message-alert";
import { useIsMobile } from "../../lib/hooks/useWindowSize";
import { useSigner } from "../../lib/hooks/useSigner";
import {
  ProcessTitle,
  ProcessDescription,
  ProcessInformation,
  ProcessContainer,
  ProcessData,
  ProcessDataInfo,
  ProcessDataContainer,
  ProcessDataDescription,
  ProcessDataValue,
  ButtonContainer,
} from "../../components/Processes/styled";
import SectionTitle from "../../components/sectionTitle";
import { Questions } from "../../components/Processes/Questions";
import Button from "../../components/button";
import { useWeights } from "../../lib/hooks/process/useWeights";
import { useProcessInfo } from "../../lib/hooks/process/useProcessInfo";
import { useVoteStatus } from "../../lib/hooks/process/useVoteStatus";

const ProcessPage = () => {
  const router = useRouter();
  const wallet = useWallet();
  const signer = useSigner();
  const isMobile = useIsMobile();
  const { setAlertMessage } = useMessageAlert();
  const { poolPromise } = usePool();
  const processId = useUrlHash().substr(1);
  const { process: proc } = useProcess(processId);
  const token = useToken(proc?.entity);
  const [tokenRegistered, setTokenRegistered] = useState(null);
  const [startDate, setStartDate] = useState(null as Date);
  const [endDate, setEndDate] = useState(null as Date);
  const [censusProof, setCensusProof] = useState(
    null as { key: string; proof: string[]; value: string }
  );

  const nullifier = VotingApi.getSignedVoteNullifier(wallet?.account || "", processId);

  if (typeof window != "undefined" && !processId.match(HEX_REGEX)) {
    console.error("Invalid process ID", processId);
    router.replace("/tokens");
  }

  const hasStarted = startDate && startDate.getTime() <= Date.now();

  const { status, updateStatus, vote } = useVoteStatus(processId, nullifier);
  const { results, updateResults } = useProcessInfo(proc, startDate);
  const { weights } = useWeights({
    processId,
    token,
    start: startDate,
    end: endDate,
  });

  const { data: voteStatus, mutate: updateVote, isValidating: fetchingVote } = vote;

  // Census status
  useEffect(() => {
    updateCensusStatus();
  }, [wallet, nullifier, token?.address]);

  // Dates
  useEffect(() => {
    updateDates();
  }, [proc?.parameters?.startBlock]);

  const updateCensusStatus = async () => {
    if (!token?.address) {
      setTokenRegistered(false);
      return;
    } else if (!wallet?.account) {
      setCensusProof(null);
      return;
    }

    const pool = await poolPromise;

    if (!(await CensusErc20Api.isRegistered(token.address, pool))) {
      setTokenRegistered(false);
      return setAlertMessage("The token contract is not yet registered");
    } else if (tokenRegistered !== true) setTokenRegistered(true);

    const processEthCreationBlock = proc.parameters.blockCount;
    const balanceSlot = CensusErc20Api.getHolderBalanceSlot(
      wallet.account,
      token.balanceMappingPosition
    );

    const proofFields = await CensusErc20Api.generateProof(
      token.address,
      [balanceSlot],
      processEthCreationBlock,
      pool.provider as providers.JsonRpcProvider
    );

    setCensusProof(proofFields.proof.storageProof[0]);
  };

  const updateDates = async () => {
    if (!proc?.parameters?.startBlock) return;
    try {
      const pool = await poolPromise;
      const getStartDate = VotingApi.estimateDateAtBlock(proc.parameters.startBlock, pool);

      const getEndDate = VotingApi.estimateDateAtBlock(
        proc.parameters.startBlock + proc.parameters.blockCount,
        pool
      );

      const [start, end] = await Promise.all([getStartDate, getEndDate]);

      setStartDate(start);
      setEndDate(end);
    } catch (error) {
      console.log(error.message);
    }
  };

  const onSelect = (questionId: number, choice: number) => {
    status.choices[questionId] = choice;
    updateStatus({
      choices: status.choices,
    });
  };

  //@TODO: Move this into a hook
  const onSubmitVote: () => Promise<void> = async () => {
    if (
      !confirm(
        "You are about to submit your vote. This action cannot be undone.\n\nDo you want to continue?"
      )
    )
      return;

    try {
      updateStatus({
        submitting: true,
      });
      const pool = await poolPromise;
      //   // Census Proof
      const holderAddr = wallet.account;
      const processEthCreationBlock = await pool.provider.getBlockNumber();
      const balanceSlot = CensusErc20Api.getHolderBalanceSlot(holderAddr, 0);
      const { proof } = await CensusErc20Api.generateProof(
        token.address,
        [balanceSlot],
        processEthCreationBlock - 1,
        pool.provider as providers.JsonRpcProvider
      );

      // Detect encryption
      const envelopParams = {
        votes: status.choices,
        censusOrigin: proc.parameters.censusOrigin,
        censusProof: proof.storageProof[0],
        processId,
        walletOrSigner: signer,
      };
      if (proc.parameters.envelopeType.hasEncryptedVotes) {
        const keys = await VotingApi.getProcessKeys(processId, pool);
        envelopParams["processKey"] = keys;
      }
      const envelope = await VotingApi.packageSignedEnvelope(envelopParams);
      console.log(envelope);
      await VotingApi.submitEnvelope(envelope, signer, pool);
      // wait a block
      await new Promise((resolve) =>
        setTimeout(resolve, Math.floor(parseInt(process.env.BLOCK_TIME) * 1000 * 1.2))
      );
      let voted = false;
      for (let i = 0; i < 10; i++) {
        const { registered } = await updateVote();
        if (registered) break;
        await new Promise((resolve) =>
          setTimeout(resolve, Math.floor(parseInt(process.env.BLOCK_TIME) * 500))
        );
      }
      if (!voted) throw new Error("The vote has not been registered");
      // detached update
      setTimeout(() => {
        updateResults();
      });
      setAlertMessage("Your vote has been sucessfully submitted");
      updateStatus({
        submitting: false,
      });
    } catch (err) {
      console.log(err);
      updateStatus({
        submitting: false,
      });
      //   console.error(err);
      //   setAlertMessage("The delivery of your vote could not be completed");
    }
  };

  const allQuestionsChosen =
    areAllNumbers(status.choices) && status.choices.length == proc?.metadata?.questions?.length;
  const hasEnded = endDate && endDate.getTime() < Date.now();
  const isInCensus = !!censusProof;

  const canVote =
    proc && isInCensus && tokenRegistered === true && !voteStatus && hasStarted && !hasEnded;

  const remainingTime = startDate
    ? hasStarted
      ? strDateDiff("end-date", endDate)
      : strDateDiff("start-date", startDate)
    : "";

  if (!processId || !proc) return renderEmpty();

  return (
    <div>
      <SectionTitle
        title={`${token?.symbol || "Token"} governance process`}
        subtitle={"Cast your vote and see the ongoing results as they are received."}
      />
      <ProcessContainer>
        <ProcessInformation>
          <ProcessTitle>{proc.metadata.title.default || "No title"}</ProcessTitle>
          <ProcessDescription>
            {proc.metadata.description.default || "No description"}
          </ProcessDescription>
        </ProcessInformation>
        <ProcessData>
          {weights &&
            weights.map(({ description, value }) => (
              <ProcessDataContainer>
                <ProcessDataInfo>
                  <ProcessDataDescription>{description}</ProcessDataDescription>
                </ProcessDataInfo>
                <ProcessDataInfo>
                  <ProcessDataValue>{value}</ProcessDataValue>
                </ProcessDataInfo>
              </ProcessDataContainer>
            ))}
        </ProcessData>
      </ProcessContainer>

      <Questions questions={results && results.questions} onChoiceSelect={onSelect} />
      <ButtonContainer>
        <Button onClick={onSubmitVote}>Submit your vote</Button>
      </ButtonContainer>
    </div>
  );
};

// TODO:
function renderEmpty() {
  return (
    <div>
      <br />
      <p>
        Loading... <Spinner />
      </p>
    </div>
  );
}

export default withRouter(ProcessPage);
