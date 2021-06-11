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
import { Case, Default, Else, If, Switch, Then } from "react-if";

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
import Button from "../../components/ControlElements/button";
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
import styled from "styled-components";

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

  const { process: processDetails, loading: processLoading, error: processError } = useProcess(
    processId
  );
  const { tokenInfo, loading: tokenLoading, error: tokenError } = useToken(
    processDetails?.state?.entityId
  );
  const {
    hasEnded,
    hasStarted,
    loading: processDatesLoading,
    error: processDatesError,
  } = useProcessDates(processDetails?.state);
  const { results, error: resultsError, refresh: refreshResults } = useProcessResults(
    processDetails,
    tokenInfo
  );
  const { summary, error: summaryError, refresh: refreshSummary } = useProcessSummary({
    processDetails,
    tokenInfo,
  });
  const { proof, loading: proofLoading, error: proofError } = useCensusProof(
    tokenInfo,
    processDetails?.state?.sourceBlockHeight
  );
  const { voteState, votingStatus, setState, submitVote, refreshVotingStatus } = useVote(
    processDetails
  );

  useEffect(() => {
    let errorName: string;
    if (processError) errorName = "proposal details";
    else if (tokenError) errorName = "token details";
    else if (processDatesError) errorName = "dates";
    else if (resultsError) errorName = "results";
    else if (proofError) errorName = "census proof";
    // else if (summaryError) errorName = "summary";
    if (!errorName) return;

    const errorMessage =
      "Oops, there was an error loading the " +
      errorName +
      ". Please refresh the page or try again later.";
    setAlertMessage(errorMessage);
  }, [processError, tokenError, processDatesError, resultsError, proofError]);

  const isConnected = !!wallet.account;
  const allQuestionsSelected =
    voteState.choices.length === processDetails?.metadata?.questions?.length;
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
      await submitVote(processDetails, proof);
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

  if (!processDetails) {
    return renderEmpty();
  }

  let mainButtonText: string;
  {
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
  }
  const isLoading = processLoading || tokenLoading || processDatesLoading || proofLoading;

  return (
    <div>
      <SectionTitle
        title={`${tokenInfo?.symbol || "Token"} proposal`}
        subtitle={"Cast your vote and view results as they come in."}
      />
      <ProcessContainer>
        <ProcessInformation>
          <ProcessTitle>
            {processDetails?.metadata?.title?.default || "(proposal title)"}
          </ProcessTitle>
          <ProcessDescription>
            {processDetails?.metadata?.description?.default || "(proposal description)"}
          </ProcessDescription>
        </ProcessInformation>
        <ProcessData>
          <ProcessDataCard>
            <If condition={summary?.length}>
              <Then>
                {summary.map(({ description, value }, i) => (
                  <ProcessDataContainer key={i}>
                    <ProcessDataInfo>
                      <ProcessDataDescription>{description}</ProcessDataDescription>
                    </ProcessDataInfo>
                    <ProcessDataInfo>
                      <ProcessDataValue>{value}</ProcessDataValue>
                    </ProcessDataInfo>
                  </ProcessDataContainer>
                ))}
              </Then>
              <Else>
                <SummaryLoading />
              </Else>
            </If>
          </ProcessDataCard>
        </ProcessData>
      </ProcessContainer>

      <Questions
        questions={processDetails?.metadata?.questions}
        results={results}
        choicesSelected={voteState?.choices}
        onChoiceSelect={onSelect}
        canSelect={canSelect}
      />

      <Switch>
        <Case condition={isLoading}>
          <Loading />
        </Case>
        <Case condition={!hasStarted}>
          <NotStartedBanner />
        </Case>
        <Case condition={hasEnded}>
          <HasFinishedBanner />
        </Case>
        <Case condition={!isConnected}>
          <NotConnected connectMessage="Connect your wallet to vote on this proposal" />
        </Case>
        <Case condition={!inCensus}>
          <NoTokens />
        </Case>
        <Case condition={hasAlreadyVoted}>
          <AlreadyVotedBanner />
        </Case>
        <Default>
          <ButtonContainer>
            <Button disabled={!canVote} mode="strong" onClick={onVoteSubmit}>
              {voteState?.submitting ? <Spinner /> : mainButtonText}
            </Button>
          </ButtonContainer>
        </Default>
      </Switch>
    </div>
  );
};

const renderEmpty = () => {
  return <LoadingSpinner fullPage />;
};

const SummaryLoading = () => {
  return (
    <CenterText>
      <small>
        Loading summary... &nbsp;
        <Spinner />
      </small>
    </CenterText>
  );
};

const CenterText = styled.p`
  margin: 0;
  text-align: center;
`;

export default ProcessPage;
