import React, { useState, useEffect } from "react";
import { VotingApi, CensusErc20Api } from "dvote-js";
import { withRouter, useRouter } from "next/router";
import Spinner from "react-svg-spinner";
import { usePool, useProcess } from "@vocdoni/react-hooks";
import { providers } from "ethers";
import { useWallet } from "use-wallet";
import { useUrlHash } from "use-url-hash";

import { HEX_REGEX } from "../../lib/regex";
import { useToken } from "../../lib/hooks/tokens";
import { useMessageAlert } from "../../lib/hooks/message-alert";
import { useIsMobile } from "../../lib/hooks/useWindowSize";
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
import { useProcessDate } from "../../lib/hooks/process/useProcessDate";
import { useVote } from "../../lib/hooks/process/useVote";

const ProcessPage = () => {
  const router = useRouter();
  const wallet = useWallet();
  const { setAlertMessage } = useMessageAlert();
  const { poolPromise } = usePool();
  const processId = useUrlHash().substr(1);
  const { process: proc } = useProcess(processId);
  const token = useToken(proc?.entity);
  const [tokenRegistered, setTokenRegistered] = useState(null);

  const nullifier = VotingApi.getSignedVoteNullifier(wallet?.account || "", processId);

  if (typeof window != "undefined" && !processId.match(HEX_REGEX)) {
    console.error("Invalid process ID", processId);
    router.replace("/tokens");
  }

  const { status, updateStatus, voteInfo, vote } = useVote(token, proc, nullifier);
  const { datesInfo } = useProcessDate(proc);
  const { results, updateResults } = useProcessInfo(proc);
  const { data: voteStatus, mutate: updateVote, isValidating: fetchingVote } = voteInfo;
  const { weights } = useWeights({
    processId,
    token,
    start: datesInfo?.start,
    end: datesInfo?.end,
  });

  const onVoteSubmit = async () => {
    await vote();
    await updateResults();
  };

  // Census status
  // useEffect(() => {
  //   updateCensusStatus();
  // }, [wallet, nullifier, token?.address]);

  // const updateCensusStatus = async () => {
  //   if (!token?.address) {
  //     setTokenRegistered(false);
  //     return;
  //   } else if (!wallet?.account) {
  //     // setCensusProof(null);
  //     return;
  //   }

  //   const pool = await poolPromise;

  //   if (!(await CensusErc20Api.isRegistered(token.address, pool))) {
  //     setTokenRegistered(false);
  //     return setAlertMessage("The token contract is not yet registered");
  //   } else if (tokenRegistered !== true) setTokenRegistered(true);

  //   const processEthCreationBlock = proc.parameters.blockCount;
  //   const balanceSlot = CensusErc20Api.getHolderBalanceSlot(
  //     wallet.account,
  //     token.balanceMappingPosition
  //   );

  //   const proofFields = await CensusErc20Api.generateProof(
  //     token.address,
  //     [balanceSlot],
  //     processEthCreationBlock,
  //     pool.provider as providers.JsonRpcProvider
  //   );

  //   // setCensusProof(proofFields.proof.storageProof[0]);
  // };

  const onSelect = (questionId: number, choice: number) => {
    status.choices[questionId] = choice;
    updateStatus({
      choices: status.choices,
    });
  };

  // const allQuestionsChosen =
  //   areAllNumbers(status.choices) && status.choices.length == proc?.metadata?.questions?.length;
  // const hasEnded = endDate && endDate.getTime() < Date.now();
  // const isInCensus = !!censusProof;

  const canVote = false;

  // const remainingTime = startDate
  //   ? hasStarted
  //     ? strDateDiff("end-date", endDate)
  //     : strDateDiff("start-date", startDate)
  //   : "";

  if (!processId || !proc) return renderEmpty();
  console.log(status.choices);
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

      <Questions
        questions={results && results.questions}
        choicesSelected={status.choices}
        onChoiceSelect={onSelect}
      />
      <ButtonContainer>
        <Button onClick={onVoteSubmit}>Submit your vote</Button>
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
