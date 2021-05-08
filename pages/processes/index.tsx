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
  EndedContainer,
  EndedInfo,
} from "../../components/Processes/styled";
import SectionTitle from "../../components/sectionTitle";
import { Questions } from "../../components/Processes/Questions";
import Button from "../../components/button";
import { useProcessResults, useProcessDates, useProcessSummary, useVote } from "../../lib/hooks/process";
import { areAllNumbers } from "../../lib/utils";
import { useCensusProof } from "../../lib/hooks/process/useCensusProof";
import { useWallet } from "use-wallet";
import { ActionTypes, useModal } from "../../components/Modal/context";
import { useScrollTop } from "../../lib/hooks/useScrollTop";

const ProcessPage = () => {
  useScrollTop();
  const router = useRouter();
  const processId = useUrlHash().substr(1);

  if (typeof window != "undefined" && !processId.match(HEX_REGEX)) {
    console.error("Invalid process ID", processId);
    router.replace("/tokens");
  }

  const { dispatch } = useModal();

  const { process } = useProcess(processId);
  const { tokenInfo, loading: tokenLoading, error: tokenError } = useToken(process?.entity);
  const { hasEnded, hasStarted } = useProcessDates(process);
  const { results, error: resultsError, loading: resultsLoading, refresh: refreshResults } = useProcessResults(process, tokenInfo);
  const { summary, error: summaryError, loading: summaryLoading, refresh: refreshSummary } = useProcessSummary({ processInfo: process, tokenInfo });
  const { proof, loading: proofLoading, error: proofError } = useCensusProof(tokenInfo, process?.parameters?.sourceBlockHeight);
  const { status, updateStatus, voteInfo, vote } = useVote(process);
  const { data: voteStatus, mutate: updateVote, isValidating: fetchingVote } = voteInfo;
  const wallet = useWallet();

  const isConnected = !!wallet.account;
  const allQuestionsSelected = status.choices.length === process?.metadata?.questions?.length;
  const questionsFilled = allQuestionsSelected && areAllNumbers(status.choices);
  const inCensus = !!proof;
  const alreadyVoted = voteStatus?.registered || status.registered;
  const canSelect = !alreadyVoted && hasStarted && !hasEnded && inCensus;
  const canVote = canSelect && questionsFilled;

  const onVoteSubmit = async () => {
    if (!isConnected) {
      return dispatch({ type: ActionTypes.OPEN_WALLET_LIST });
    }

    await vote(process, proof);
    await refreshResults();
    await updateVote();
    await refreshSummary();
  };

  const onSelect = (questionId: number, choice: number) => {
    status.choices[questionId] = choice;
    updateStatus({
      choices: status.choices,
    });
  };

  if (!processId || !process) return renderEmpty();

  let mainButtonText: string
  if (!isConnected) mainButtonText = "Connect your wallet"
  else if (!inCensus) {
    if (proofLoading) mainButtonText = "Please wait"
    else mainButtonText = "You are not a token holder"
  }
  else if (alreadyVoted) mainButtonText = "You already voted"
  else if (!hasStarted) mainButtonText = "Voting has not started yet"
  else if (hasEnded) mainButtonText = "Voting has ended"
  else if (!questionsFilled) mainButtonText = "Fill all the choices"
  else if (!canVote) mainButtonText = "You cannot vote" // catch-all
  else mainButtonText = "Submit your vote"

  // TODO: Use tokenLoading, tokenError, resultsError, resultsLoading, summaryError, summaryLoading

  return (
    <div>
      <SectionTitle
        title={`${tokenInfo?.symbol || "Token"} governance process`}
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
          {summary?.length ?
            summary.map(({ description, value }, i) => (
              <ProcessDataContainer key={i}>
                <ProcessDataInfo>
                  <ProcessDataDescription>{description}</ProcessDataDescription>
                </ProcessDataInfo>
                <ProcessDataInfo>
                  <ProcessDataValue>{value}</ProcessDataValue>
                </ProcessDataInfo>
              </ProcessDataContainer>
            )) : <p>Loading... <Spinner /></p>}
        </ProcessData>
      </ProcessContainer>

      <Questions
        questions={process.metadata.questions}
        results={results}
        choicesSelected={status.choices}
        onChoiceSelect={onSelect}
        canSelect={canSelect}
      />
      {hasEnded ? (
        <EndedContainer>
          <img src="/media/ended.svg" />
          <EndedInfo>The process has ended</EndedInfo>
        </EndedContainer>
      ) : (
        <ButtonContainer>
          <Button
            // @TODO: Improve this conditional
            disabled={isConnected && !canVote}
            onClick={onVoteSubmit}
          >
            {status.submitting ? <Spinner /> : mainButtonText}
          </Button>
        </ButtonContainer>
      )}
    </div>
  );
};

// TODO: Render a better UI
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
