import React, { useState, useEffect } from "react";
import {
  VotingApi,
  CensusErc20Api,
  DigestedProcessResults,
  ProcessMetadata,
  DigestedProcessResultItem,
  ProcessStatus,
} from "dvote-js";
import { withRouter, useRouter } from "next/router";
import Spinner from "react-svg-spinner";
import { usePool, useProcess } from "@vocdoni/react-hooks";
import { BigNumber, providers } from "ethers";
import TokenAmount from "token-amount";
import { useWallet } from "use-wallet";
import { useUrlHash } from "use-url-hash";

import { TokenInfo } from "../../lib/types";
import { strDateDiff } from "../../lib/date";
import { HEX_REGEX } from "../../lib/regex";
import { areAllNumbers } from "../../lib/utils";
import { useToken } from "../../lib/hooks/tokens";
import { useMessageAlert } from "../../lib/hooks/message-alert";
import { TopSection } from "../../components/top-section";
import { useIsMobile } from "../../lib/hooks/useWindowSize";
import { useSigner } from "../../lib/hooks/useSigner";
import {
  ChoiceResult,
  ChoicePercent,
  Box,
  ChoiceText,
  VotesAmount,
  Radio,
  ChoiceDescription,
  Question,
  QuestionLeftSection,
  QuestionNumber,
  QuestionDescription,
  QuestionRightSection,
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

const BN_ZERO = BigNumber.from(0);

const ChoicesResults = ({ choices, resultsQuestion, token, totalVotes }) => {
  return choices.map((_, id) => {
    if (resultsQuestion && resultsQuestion.voteResults && resultsQuestion.voteResults[id]) {
      const title = resultsQuestion.voteResults[id].title.default;
      const voteCount = resultsQuestion.voteResults[id].votes || BN_ZERO;
      const percent = totalVotes.isZero()
        ? 0 // = voteCount / totalVotes * 100
        : Math.round(voteCount.mul(10000).div(totalVotes).toNumber()) / 100;
      const amount = token
        ? new TokenAmount(voteCount, token.decimals, {
            symbol: token.symbol,
          }).format()
        : "";

      return (
        <ChoiceResult key={id}>
          <ChoicePercent>
            <Box>{percent.toFixed(1)} %</Box>
          </ChoicePercent>
          <ChoiceText>
            <span>{title}</span>
            <VotesAmount>{amount} votes</VotesAmount>
          </ChoiceText>
        </ChoiceResult>
      );
    }
    return null;
  });
};

const ClickableChoices = ({ choices, questionId, onSelect }) => {
  return choices.map((choice, id) => (
    <Radio key={id}>
      {" "}
      <input
        type="radio"
        onClick={() => onSelect(questionId, choice.value)}
        name={"question-" + questionId}
      />
      <div className="checkmark"></div>
      <ChoiceDescription>{choice.title.default}</ChoiceDescription>
    </Radio>
  ));
};

const ReadOnlyChoices = ({ choices }) => {
  return choices.map((choice, id) => (
    <Radio key={id}>
      {" "}
      <input type="radio" checked={false} />
      <div className="checkmark"></div>
      <ChoiceDescription>{choice.title.default}</ChoiceDescription>
    </Radio>
  ));
};

const Choices = ({
  id,
  question,
  results,
  token,
  canVote,
  hasVoted,
  hasWallet,
  onSelect,
  hasEnded,
  resultsQuestion,
  questionVoteCount,
}: ChoicesProps & {
  resultsQuestion: DigestedProcessResultItem;
  questionVoteCount: BigNumber;
}) => {
  const resultsAvailable = results?.questions?.length;
  if ((resultsAvailable && hasEnded) || hasVoted) {
    return (
      <ChoicesResults
        choices={question.choices}
        resultsQuestion={resultsQuestion}
        token={token}
        totalVotes={questionVoteCount}
      />
    );
  }

  if (canVote && !hasVoted && hasWallet) {
    return <ClickableChoices choices={question.choices} questionId={id} onSelect={onSelect} />;
  }

  return <ReadOnlyChoices choices={question.choices} />;
};

const ProcessQuestions = ({
  proc,
  results,
  token,
  canVote,
  hasVoted,
  wallet,
  onSelect,
  hasEnded,
}) => {
  return proc.metadata.questions.map((question, qIdx) => {
    const questionProps = {
      id: qIdx,
      question,
      results,
      token,
      canVote,
      hasVoted,
      hasWallet: !!wallet?.account,
      onSelect,
      hasEnded,
    };
    return <QuestionRow key={`question_${qIdx}`} {...questionProps} />;
  });
};

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
  const [hasVoted, setHasVoted] = useState(false);
  const [refreshingVotedStatus, setRefreshingVotedStatus] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [choices, setChoices] = useState([] as number[]);

  const nullifier = VotingApi.getSignedVoteNullifier(wallet?.account || "", processId);

  if (typeof window != "undefined" && !processId.match(HEX_REGEX)) {
    console.error("Invalid process ID", processId);
    router.replace("/tokens");
  }

  const hasStarted = startDate && startDate.getTime() <= Date.now();

  const { weights } = useWeights({
    processId,
    token,
    start: startDate,
    end: endDate,
  });

  const { results, updateResults } = useProcessInfo(proc, startDate);

  // Effects
  useEffect(() => {
    let skip = false;

    const refreshInterval = setInterval(() => {
      if (skip) return;

      Promise.all([updateVoteStatus()]).catch((err) => {
        setAlertMessage(err.message);
        console.error(err);
      });
    }, 1000 * 20);

    return () => {
      skip = true;
      clearInterval(refreshInterval);
    };
  }, [processId]);

  // // Vote results
  // useEffect(() => {
  //   updateResults();
  // }, [token, processId, hasStarted, hasVoted]);

  // Vote status
  useEffect(() => {
    updateVoteStatus();
  }, [wallet, nullifier]);

  // Census status
  useEffect(() => {
    updateCensusStatus();
  }, [wallet, nullifier, token?.address]);

  // Dates
  useEffect(() => {
    updateDates();
  }, [proc?.parameters?.startBlock]);

  // Loaders
  const updateVoteStatus = () => {
    if (!processId || !nullifier) return;
    setRefreshingVotedStatus(true);

    poolPromise
      .then((pool) => VotingApi.getEnvelopeStatus(processId, nullifier, pool))
      .then(({ registered }) => {
        setRefreshingVotedStatus(false);
        setHasVoted(registered);
      })
      .catch((err) => {
        setRefreshingVotedStatus(false);
        console.error(err);
      });
  };

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

    const processEthCreationBlock = proc.parameters.evmBlockHeight;
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

  // Callbacks
  const onSelect = (questionIdx: number, choiceValue: number) => {
    if (typeof choiceValue == "string") choiceValue = parseInt(choiceValue);
    if (isNaN(choiceValue)) return setAlertMessage("Invalid question value");

    choices[questionIdx] = choiceValue;
    setChoices([].concat(choices));
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
      setIsSubmitting(true);

      const pool = await poolPromise;

      // Census Proof
      const holderAddr = wallet.account;
      const processEthCreationBlock = proc.parameters.evmBlockHeight;
      const balanceSlot = CensusErc20Api.getHolderBalanceSlot(
        holderAddr,
        token.balanceMappingPosition
      );
      const { proof } = await CensusErc20Api.generateProof(
        token.address,
        [balanceSlot],
        processEthCreationBlock,
        pool.provider as providers.JsonRpcProvider
      );

      // Detect encryption
      if (proc.parameters.envelopeType.hasEncryptedVotes) {
        const keys = await VotingApi.getProcessKeys(processId, pool);
        const envelope = await VotingApi.packageSignedEnvelope({
          votes: choices,
          censusOrigin: proc.parameters.censusOrigin,
          censusProof: proof.storageProof[0],
          processId,
          walletOrSigner: signer,
          processKeys: keys,
        });
        await VotingApi.submitEnvelope(envelope, signer, pool);
      } else {
        const envelope = await VotingApi.packageSignedEnvelope({
          votes: choices,
          censusOrigin: proc.parameters.censusOrigin,
          censusProof: proof.storageProof[0],
          processId,
          walletOrSigner: signer,
        });
        await VotingApi.submitEnvelope(envelope, signer, pool);
      }

      // wait a block
      await new Promise((resolve) =>
        setTimeout(resolve, Math.floor(parseInt(process.env.BLOCK_TIME) * 1000 * 1.2))
      );

      let voted = false;
      for (let i = 0; i < 10; i++) {
        const { registered, date } = await VotingApi.getEnvelopeStatus(processId, nullifier, pool);
        voted = registered;
        setHasVoted(voted);

        if (registered) break;
        await new Promise((resolve) =>
          setTimeout(resolve, Math.floor(parseInt(process.env.BLOCK_TIME) * 500))
        );
      }
      if (!voted) throw new Error("The vote has not been registered");

      // detached update
      setTimeout(() => {
        updateResults();
        updateVoteStatus();
      });

      setAlertMessage("Your vote has been sucessfully submitted");
      setHasVoted(true);
      setIsSubmitting(false);
    } catch (err) {
      console.error(err);
      setIsSubmitting(false);
      setAlertMessage("The delivery of your vote could not be completed");
    }
  };

  const allQuestionsChosen =
    areAllNumbers(choices) && choices.length == proc?.metadata?.questions?.length;
  const hasEnded = endDate && endDate.getTime() < Date.now();
  const isInCensus = !!censusProof;

  const canVote =
    proc && isInCensus && tokenRegistered === true && !hasVoted && hasStarted && !hasEnded;

  const remainingTime = startDate
    ? hasStarted
      ? strDateDiff("end-date", endDate)
      : strDateDiff("start-date", startDate)
    : "";

  let status = "";
  switch (proc?.parameters.status.value) {
    case ProcessStatus.READY:
      if (hasEnded) status = "The process is closed";
      else if (hasStarted) status = "The process is open for voting";
      else if (!hasStarted) status = "The process is ready and will start soon";
      break;
    case ProcessStatus.PAUSED:
      status = "The process is paused";
      break;
    case ProcessStatus.CANCELED:
      status = "The process has been canceled";
      break;
    case ProcessStatus.ENDED:
    case ProcessStatus.RESULTS:
      status = "The process has ended";
      break;
  }

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

      <Questions {...results.questions} />
      <ButtonContainer>
        <Button disabled>Submit your vote</Button>
      </ButtonContainer>
    </div>
  );
};

interface ChoicesProps {
  id: number;
  question: ProcessMetadata["questions"][0];
  results: DigestedProcessResults;
  token: TokenInfo;

  canVote: boolean;
  hasVoted: boolean;
  hasWallet: boolean;
  hasEnded: boolean;
  onSelect: (id: number, choiceValue: number) => void;
}

function QuestionRow(questionInfo: ChoicesProps) {
  const { id, question, results } = questionInfo;
  const resultsQuestion = results && results.questions[id];
  const questionVoteCount =
    (resultsQuestion &&
      resultsQuestion.voteResults.reduce((prev, cur) => prev.add(cur.votes || BN_ZERO), BN_ZERO)) ||
    BN_ZERO;

  return (
    <Question key={id}>
      <QuestionLeftSection>
        <QuestionNumber>Question {id + 1}</QuestionNumber>
        <h3>{question.title.default || "No title"}</h3>
        <QuestionDescription>
          {question.description.default || "No description"}
        </QuestionDescription>
      </QuestionLeftSection>
      <QuestionRightSection>
        <Choices
          {...questionInfo}
          resultsQuestion={resultsQuestion}
          questionVoteCount={questionVoteCount}
        />
      </QuestionRightSection>
    </Question>
  );
}

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
