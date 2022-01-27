import React, { useEffect } from "react";
import Spinner from "react-svg-spinner";
import { useProcess } from "@vocdoni/react-hooks";
import { Case, Default, Else, If, Switch, Then } from "react-if";
import styled from "styled-components";

import { useToken } from "../../lib/contexts/tokens";
import {
  useCensusProof,
  useProcessResults,
  useProcessDates,
  useProcessSummary,
  useVote,
} from "../../lib/hooks/process";
import { areAllNumbers } from "../../lib/utils";
import { useSigner } from "../../lib/hooks/useSigner";
import { useScrollTop } from "../../lib/hooks/useScrollTop";
import { useMessageAlert } from "../../lib/contexts/message-alert";
import { EventType, trackEvent } from "../../lib/analytics";
import { USER_CANCELED_TX } from "../../lib/errors";
import { useProcessIdFromUrl } from "../../lib/hooks/useProcessIdFromUrl";

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
// import { ActionTypes, useModal } from "../../lib/contexts/modal";
import { LoadingSpinner } from "../../components/loading-spinner";
import {
  NotConnected,
  NoTokensAtCreation,
  HasFinishedBanner,
  NotStartedBanner,
  AlreadyVotedBanner,
  Loading,
} from "../../components/Banners/GrayBanners";
import { useUserHoldsToken } from "../../lib/hooks/tokens";
import { useOnNetworkChange } from "../../lib/hooks/useOnNetworkChange";

const ProcessPage = () => {
  useScrollTop();
  useOnNetworkChange();
  const processId = useProcessIdFromUrl();

  const { setAlertMessage } = useMessageAlert();
  const { address: holderAddress, methods, status: signerStatus } = useSigner();

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

  const {
    holdsBalance: hasBalance,
    error: holdsBalanceError,
    loading: holdsBalanceLoading,
  } = useUserHoldsToken(holderAddress, tokenInfo?.address);

  useEffect(() => {
    let errorName: string;
    if (processError) errorName = "proposal details";
    else if (tokenError) errorName = "token details";
    else if (processDatesError) errorName = "dates";
    else if (resultsError) errorName = "results";
    else if (summaryError) errorName = "summary";
    else if (proofError) {
      if (proofError === "You are not a token holder") return;
      errorName = "census proof";
    } else if (holdsBalanceError) errorName = "user balance";

    if (!errorName) return;

    const errorMessage =
      "Oops, there was an error loading the " +
      errorName +
      ". Please refresh the page or try again later.";
    setAlertMessage(errorMessage);
  }, [processError, tokenError, processDatesError, resultsError, proofError, holdsBalanceError]);

  const isConnected = signerStatus === "connected";
  const allQuestionsSelected =
    voteState.choices.length === processDetails?.metadata?.questions?.length;
  const questionsFilled = allQuestionsSelected && areAllNumbers(voteState.choices);
  const inCensus = !!proof;
  const hasAlreadyVoted = votingStatus?.registered || voteState.submitted;
  const canSelect = !hasAlreadyVoted && hasStarted && !hasEnded && inCensus;
  const canVote = canSelect && questionsFilled;

  const onVoteSubmit = async () => {
    if (!isConnected) {
      // return dispatch({ type: ActionTypes.OPEN_WALLET_LIST });
      methods.selectWallet().catch((err) => {
        setAlertMessage("Could not connect to the wallet");
        console.error(err);
      });
      return;
    }
    try {
      await submitVote(processDetails, proof);
      trackEvent(EventType.VOTE_SUBMITTED, { proposal_id: processId });
    } catch (error) {
      /* User cancels tx (e.g., by aborting signing process.) This is not registered as "failure"*/
      if ((error?.message || "").includes("signature")) {
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

  const buttonText: string = questionsFilled ? "Submit your vote" : "Fill all the choices";
  const isLoading = processLoading || tokenLoading || proofLoading;

  return (
    <>
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
        <Case condition={!inCensus && hasBalance}>
          <NoTokensAtCreation tokenSymbol={tokenInfo?.symbol} />
        </Case>
        <Case condition={!inCensus}>
          <NoTokensAtCreation stillNoTokens tokenSymbol={tokenInfo?.symbol} />
        </Case>
        <Case condition={hasAlreadyVoted}>
          <AlreadyVotedBanner />
        </Case>
        <Default>
          <ButtonContainer>
            <Button disabled={!canVote} mode="strong" onClick={onVoteSubmit}>
              {voteState?.submitting ? <Spinner /> : buttonText}
            </Button>
          </ButtonContainer>
        </Default>
      </Switch>
    </>
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
