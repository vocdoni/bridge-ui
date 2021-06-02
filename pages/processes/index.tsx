import React, { useEffect } from "react";
import { useRouter } from "next/router";
import Spinner from "react-svg-spinner";
import { useProcess } from "@vocdoni/react-hooks";
import { useUrlHash } from "use-url-hash";

import { HEX_REGEX } from "../../lib/regex";
import { useToken } from "../../lib/hooks/tokens";
import {
  useProcessResults,
  useProcessDates,
  useProcessSummary,
  useVote,
} from "../../lib/hooks/process";
import { areAllNumbers } from "../../lib/utils";
import { useCensusProof } from "../../lib/hooks/process/useCensusProof";
import { useWallet } from "use-wallet";
import { useScrollTop } from "../../lib/hooks/useScrollTop";
import { useMessageAlert } from "../../lib/hooks/message-alert";
import { EventType, trackEvent } from "../../lib/analytics";
import { USER_CANCELED_TX } from "../../lib/errors";

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
  ProcessDataCard,
} from "../../components/Processes/styled";
import SectionTitle from "../../components/sectionTitle";
import { Questions } from "../../components/Processes/Questions";
import Button from "../../components/button";
import { ActionTypes, useModal } from "../../components/Modal/context";
import { LoadingSpinner } from "../../components/loading-spinner";
import {
  NotConnected,
  NoTokens,
  HasFinishedBanner,
  NotStartedBanner,
  AlreadyVotedBanner,
  Loading,
} from "../../components/Banners/GrayBanners";

const ProcessPage = () => {
  useScrollTop();
  const router = useRouter();
  const processId = useUrlHash().substr(1);

  if (typeof window != "undefined" && !processId.match(HEX_REGEX)) {
    console.error("Invalid process ID", processId);
    router.replace("/tokens");
  }

  const wallet = useWallet();
  const { dispatch } = useModal();
  const { setAlertMessage } = useMessageAlert();

  const { process, loading: processLoading, error: processError } = useProcess(processId);
  const { tokenInfo, loading: tokenLoading, error: tokenError } = useToken(process?.entity);
  const {
    hasEnded,
    hasStarted,
    loading: processDatesLoading,
    error: processDatesError,
  } = useProcessDates(process);
  const { results, error: resultsError, refresh: refreshResults } = useProcessResults(
    process,
    tokenInfo
  );
  const { summary, error: summaryError, refresh: refreshSummary } = useProcessSummary({
    processInfo: process,
    tokenInfo,
  });
  const { proof, loading: proofLoading, error: proofError } = useCensusProof(
    tokenInfo,
    process?.parameters?.sourceBlockHeight
  );
  const { voteState, votingStatus, setState, submitVote, refreshVotingStatus } = useVote(process);

  useEffect(() => {
    let errorName = "";
    if (processError) errorName += "process";
    else if (tokenError) errorName += "token";
    else if (processDatesError) errorName += "processDates";
    else if (resultsError) errorName += "results";
    else if (proofError) errorName += "proof";
    // else if (summaryError) errorName += "summary";
    if (errorName !== "") {
      const errorMessage =
        "Oops, there was an error loading the " +
        errorName +
        " information. Please refresh the page or try again later.";
      setAlertMessage(errorMessage);
    }
  }, [processError, tokenError, processDatesError, resultsError, proofError]);

  const isConnected = !!wallet.account;
  const allQuestionsSelected = voteState.choices.length === process?.metadata?.questions?.length;
  const questionsFilled = allQuestionsSelected && areAllNumbers(voteState.choices);
  const inCensus = !!proof;
  const hasAlreadyVoted = votingStatus?.registered || voteState.submitted;
  const canSelect = !hasAlreadyVoted && hasStarted && !hasEnded && inCensus;
  const canVote = canSelect && questionsFilled;

  const onVoteSubmit = async () => {
    if (!isConnected) {
      return dispatch({ type: ActionTypes.OPEN_WALLET_LIST });
    }
    try {
      await submitVote(process, proof);
      trackEvent(EventType.VOTE_SUBMITTED, { proposal_id: processId });
    } catch (error) {
      /* User cancels tx (e.g., by aborting signing process.) This is not registered as "failure"*/
      if ((error.message as string).includes("signature")) {
        trackEvent(EventType.TX_CANCELED, { event_canceled: "voting" });
        return setAlertMessage(USER_CANCELED_TX);
      }
      return setAlertMessage("The vote could not be submitted");
    }
    await refreshResults();
    await refreshVotingStatus();
    await refreshSummary();
  };

  const onSelect = (questionId: number, choice: number) => {
    voteState.choices[questionId] = choice;
    setState({
      choices: voteState.choices,
    });
  };

  if (!processId || !process) return renderEmpty();

  let mainButtonText: string;
  if (!isConnected) mainButtonText = "Connect wallet";
  else if (!inCensus) {
    if (proofLoading) mainButtonText = "Please wait";
    else mainButtonText = "You are not a token holder";
  } else if (hasAlreadyVoted) mainButtonText = "You already voted";
  else if (!hasStarted) mainButtonText = "Voting has not started yet";
  else if (hasEnded) mainButtonText = "Voting has ended";
  else if (!questionsFilled) mainButtonText = "Fill all the choices";
  else if (!canVote) mainButtonText = "You cannot vote";
  // catch-all
  else mainButtonText = "Submit your vote";

  const isLoading = processLoading || tokenLoading || processDatesLoading || proofLoading;

  return (
    <div>
      <SectionTitle
        title={`${tokenInfo?.symbol || "Token"} proposal`}
        subtitle={"Cast your vote and view results as they come in."}
      />
      <ProcessContainer>
        <ProcessInformation>
          <ProcessTitle>{process.metadata.title.default || "No title"}</ProcessTitle>
          <ProcessDescription>
            {process.metadata.description.default || "No description"}
          </ProcessDescription>
        </ProcessInformation>
        <ProcessData>
          <ProcessDataCard>
            {summary?.length ? (
              summary.map(({ description, value }, i) => (
                <ProcessDataContainer key={i}>
                  <ProcessDataInfo>
                    <ProcessDataDescription>{description}</ProcessDataDescription>
                  </ProcessDataInfo>
                  <ProcessDataInfo>
                    <ProcessDataValue>{value}</ProcessDataValue>
                  </ProcessDataInfo>
                </ProcessDataContainer>
              ))
            ) : (
              <LoadingSpinner fullPage={false} />
            )}
          </ProcessDataCard>
        </ProcessData>
      </ProcessContainer>

      <Questions
        questions={process.metadata.questions}
        results={results}
        choicesSelected={voteState.choices}
        onChoiceSelect={onSelect}
        canSelect={canSelect}
      />

      {isLoading ? (
        <Loading />
      ) : !hasStarted ? (
        <NotStartedBanner />
      ) : hasEnded ? (
        <HasFinishedBanner />
      ) : !isConnected ? (
        <NotConnected connectMessage="Connect your wallet to vote on this proposal" />
      ) : !inCensus ? (
        <NoTokens />
      ) : hasAlreadyVoted ? (
        <AlreadyVotedBanner />
      ) : (
        <ButtonContainer>
          <Button disabled={!canVote} mode="strong" onClick={onVoteSubmit}>
            {voteState.submitting ? <Spinner /> : mainButtonText}
          </Button>
        </ButtonContainer>
      )}
    </div>
  );
};

// TODO: Render a better UI
function renderEmpty() {
  return <LoadingSpinner fullPage={true} />;
}

export default ProcessPage;
