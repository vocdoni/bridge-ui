import React from "react";
import { withRouter, useRouter } from "next/router";
import Spinner from "react-svg-spinner";
import { useProcess } from "@vocdoni/react-hooks";
import { useUrlHash } from "use-url-hash";

import { HEX_REGEX } from "../../lib/regex";
import { useToken } from "../../lib/hooks/tokens";
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
import { useProcessInfo, useProcessDate, useWeights, useVote } from "../../lib/hooks/process";
import { areAllNumbers } from "../../lib/utils";
import { useCensusProof } from "../../lib/hooks/process/useCensusProof";
import { useWallet } from "use-wallet";
import { ActionTypes, useModal } from "../../components/Modal/context";
import { useMessageAlert } from "../../lib/hooks/message-alert";

const ProcessPage = () => {
  const router = useRouter();
  const processId = useUrlHash().substr(1);

  if (typeof window != "undefined" && !processId.match(HEX_REGEX)) {
    console.error("Invalid process ID", processId);
    router.replace("/tokens");
  }

  const { dispatch } = useModal();
  const { setAlertMessage } = useMessageAlert();

  const { process } = useProcess(processId);
  const token = useToken(process?.entity);
  const { datesInfo, hasEnded } = useProcessDate(process);
  const { results, updateResults } = useProcessInfo(process, token);
  const { weights } = useWeights({
    processId,
    token,
    ...datesInfo,
  });
  const { status, updateStatus, voteInfo, vote } = useVote(token, process);
  const census = useCensusProof(token);
  const { data: voteStatus, mutate: updateVote, isValidating: fetchingVote } = voteInfo;
  const wallet = useWallet();

  const isConnected = !!wallet.account;
  const allQuestionsChosen = status.choices.length === process?.metadata?.questions?.length;
  const inCensus = census && !!census.proof;
  const questionsFilled = allQuestionsChosen && areAllNumbers(status.choices);
  const alreadyVoted = voteStatus?.registered;

  const canVote = !alreadyVoted && !hasEnded && inCensus;
  const onVoteSubmit = async () => {
    if (!isConnected) {
      return dispatch({
        type: ActionTypes.OPEN_WALLET_LIST,
      });
    }

    await vote();
    await updateResults();
    await updateVote();
    setAlertMessage("Vote succesful :-)", "success");
  };

  const onSelect = (questionId: number, choice: number) => {
    status.choices[questionId] = choice;
    updateStatus({
      choices: status.choices,
    });
  };

  if (!processId || !process) return renderEmpty();

  return (
    <div>
      <SectionTitle
        title={`${token?.symbol || "Token"} governance process`}
        subtitle={"Cast your vote and see the ongoing results as they are received."}
      />
      <ProcessContainer>
        <ProcessInformation>
          <ProcessTitle>{process.metadata.title.default || "No title"}</ProcessTitle>
          <ProcessDescription>
            {process.metadata.description.default || "No description"}
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
        canVote={canVote}
      />
      <ButtonContainer>
        <Button disabled={!canVote && questionsFilled} onClick={onVoteSubmit}>
          {!isConnected
            ? "Connect your wallet"
            : !inCensus
            ? "You're not a token holder"
            : !questionsFilled
            ? "Fill all the choices"
            : "Submit your vote"}
        </Button>
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
