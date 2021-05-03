import React, { useState } from "react";
import {
  CensusErc20Api,
  IProcessCreateParams,
  ProcessCensusOrigin,
  ProcessEnvelopeType,
  ProcessMetadata,
  ProcessMode,
  VotingApi,
} from "dvote-js";
import styled from "styled-components";
import { usePool } from "@vocdoni/react-hooks";
import { useUrlHash } from "use-url-hash";
import { useWallet } from "use-wallet";
import { ProcessMetadataTemplate } from "dvote-js";
import Datetime from "react-datetime";
import moment, { Moment } from "moment";
import Router from "next/router";
import Spinner from "react-svg-spinner";
import { providers } from "ethers";

import { PrimaryButton, SecondaryButton } from "../../components/button";
import { useMessageAlert } from "../../lib/hooks/message-alert";
import RadioChoice from "../../components/radio";
import { useIsMobile } from "../../lib/hooks/useWindowSize";
import { handleValidation } from "../../lib/processValidator";
import { useSigner } from "../../lib/hooks/useSigner";
import { ConnectButton } from "../../components/connect-button";
import { PlusBox, MinusContainer } from "../../components/plusBox";
import SectionTitle from "../../components/sectionTitle";
import TextInput, { DescriptionInput } from "../../components/input";
import Tooltip from "../../components/tooltip";

import { findMaxValue } from "../../lib/utils";

const NewProcessContainer = styled.div`
  input[type="text"],
  textarea {
    border: none;
    background-color: ${({ theme }) => theme.blackAndWhite.w1};
    padding: 1em;
    margin-top: 1em;
    border-radius: 8px;
    width: calc(100% - 2 * 1em);
  }

  textarea {
    min-height: 72px;
  }
`;

const FieldRow = styled.div`
  margin-top: 2em;
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  @media ${({ theme }) => theme.screens.tablet} {
    flex-direction: column;
  }
`;

const FieldRowLeftSection = styled.div`
  max-width: 735px;
`;

const FieldRowRightSection = styled.div<{ marginTop: number }>`
  width: 480px;
  margin-top: ${({ marginTop }) => marginTop}px;
  @media ${({ theme }) => theme.screens.tablet} {
    margin-top: 25px;
    margin-left: 0;
  }
`;

const RemoveButton = styled.div<{ marginTop: number }>`
  flex: 35%;
  margin-left: 6.5em;
  margin-top: ${({ marginTop }) => marginTop}px;
  @media ${({ theme }) => theme.screens.tablet} {
    margin-top: 25px;
    margin-left: 0;
  }
`;

const RowQuestions = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
`;

const RowQuestionLeftSection = styled.div`
  flex: 6;
  width: 700px;
  @media ${({ theme }) => theme.screens.tablet} {
    flex: 12;
  }
`;

const RowQuestionRightSection = styled.div`
  flex: 4;
  padding-left: 2em;
  @media ${({ theme }) => theme.screens.tablet} {
    flex: 0;
    padding-left: 0;
  }
`;

const ChoiceRightSection = styled.div`
  flex: 6;
  margin-left: 13px;
  display: flex;
  flex-direction: column;
  justify-content: center;

  @media ${({ theme }) => theme.screens.tablet} {
    flex: 0;
  }
`;

const QuestionNumber = styled.h6`
  color: ${({ theme }) => theme.primary.p1};
  font-size: 18px;
  margin-bottom: -18px;
  font-weight: 500;
  line-height: 150%;
`;

const QuestionText = styled.h5`
  font-size: 28px;
  font-style: normal;
  font-weight: 500;
  line-height: 38px;
  letter-spacing: -0.03em;
  margin-bottom: 85px;
  color: ${({ theme }) => theme.blackAndWhite.b1};
`;

const RowContinue = styled.div`
  margin-top: 5em;

  display: flex;
  justify-content: space-around;

  & > * {
    min-width: 250px;
  }
`;

const SubmitButton = ({ submitting, onSubmit }) =>
  submitting ? (
    <p>
      Please wait...
      <Spinner />
    </p>
  ) : (
    <PrimaryButton onClick={onSubmit}>Create proposal</PrimaryButton>
  );

const NewProcessPage = () => {
  const { poolPromise } = usePool();
  const signer = useSigner();
  const wallet = useWallet();

  const isMobile = useIsMobile();

  const [metadata, setMetadata] = useState<ProcessMetadata>(
    JSON.parse(JSON.stringify(ProcessMetadataTemplate))
  );
  const [envelopeType, setEnvelopeType] = useState(new ProcessEnvelopeType(0));
  const [startDate, setStartDate] = useState(null as Date);
  const [endDate, setEndDate] = useState(null as Date);
  const tokenAddress = useUrlHash().substr(1);
  const [submitting, setSubmitting] = useState(false);
  const { setAlertMessage } = useMessageAlert();

  // Callbacks
  const handleChoice = ({ currentQuestion, choices, currentChoice }) => {
    const isDefault = choices[currentChoice].title.default;
    const isLastQuestion = currentChoice === choices.length - 1;

    if (isDefault && isLastQuestion) {
      onAddChoice(currentQuestion);
      return;
    }

    onRemoveChoice(currentQuestion, currentChoice);
  };

  const onStartDate = (date: string | Moment) => {
    if (typeof date == "string") return;
    setStartDate(date.toDate());
  };
  const onEndDate = (date: string | Moment) => {
    if (typeof date == "string") return;
    setEndDate(date.toDate());
  };

  const setMainTitle = (title: string) => {
    metadata.title.default = title;
    setMetadata(Object.assign({}, metadata));
  };
  const setMainDescription = (description: string) => {
    metadata.description.default = description;
    setMetadata(Object.assign({}, metadata));
  };
  const setEncryptedVotes = (value: boolean) => {
    let current = envelopeType.value;
    if (value) current = current | ProcessEnvelopeType.ENCRYPTED_VOTES;
    else current = current & ~ProcessEnvelopeType.ENCRYPTED_VOTES & 0xff;
    setEnvelopeType(new ProcessEnvelopeType(current));
  };
  const setQuestionTitle = (qIdx: number, title: string) => {
    if (!metadata.questions[qIdx]) return;
    metadata.questions[qIdx].title.default = title;
    setMetadata(Object.assign({}, metadata));
  };
  const setQuestionDescription = (qIdx: number, description: string) => {
    if (!metadata.questions[qIdx]) return;
    metadata.questions[qIdx].description.default = description;
    setMetadata(Object.assign({}, metadata));
  };
  const setChoiceText = (qIdx, cIdx, text: string) => {
    if (!metadata.questions[qIdx]) return;
    else if (!metadata.questions[qIdx].choices[cIdx]) return;
    metadata.questions[qIdx].choices[cIdx].title.default = text;
    setMetadata(Object.assign({}, metadata));
  };
  const onAddQuestion = () => {
    metadata.questions.push(JSON.parse(JSON.stringify(ProcessMetadataTemplate.questions[0])));
    setMetadata(Object.assign({}, metadata));
  };

  const onRemoveQuestion = (questionToRemove: number) => {
    const newQuestions = metadata.questions.filter((_, id) => {
      return questionToRemove !== id;
    });

    const newMetadata = { ...metadata, questions: newQuestions };
    setMetadata(newMetadata);
  };

  const onAddChoice = (qIdx: number) => {
    if (!metadata.questions[qIdx]) return;
    metadata.questions[qIdx].choices.push({
      title: { default: "" },
      value: metadata.questions[qIdx].choices.length,
    });
    setMetadata(Object.assign({}, metadata));
  };
  const onRemoveChoice = (qIdx: number, cIdx: number) => {
    if (!metadata.questions[qIdx]) return;
    else if (metadata.questions[qIdx].choices.length <= 2) return;

    metadata.questions[qIdx].choices.splice(cIdx, 1);
    for (let i = 0; i < metadata.questions[qIdx].choices.length; i++) {
      metadata.questions[qIdx].choices[i].value = i;
    }
    setMetadata(Object.assign({}, metadata));
  };
  const onSubmit = async () => {
    try {
      metadata.questions.map(handleValidation);
    } catch (error) {
      return setAlertMessage(error.message);
    }

    if (!metadata.title || metadata.title.default.trim().length < 2)
      return setAlertMessage("Please enter a title");
    else if (metadata.title.default.trim().length > 50)
      return setAlertMessage("Please enter a shorter title");

    if (!metadata.description || metadata.description.default.trim().length < 2)
      return setAlertMessage("Please enter a description");
    else if (metadata.description.default.trim().length > 300)
      return setAlertMessage("Please enter a shorter description");

    if (!startDate) return setAlertMessage("Please, enter a start date");
    else if (!endDate) return setAlertMessage("Please, enter an ending date");

    if (moment(startDate).isBefore(moment().add(5, "minutes"))) {
      return setAlertMessage("The start date must be at least 5 minutes from now");
    } else if (moment(endDate).isBefore(moment().add(10, "minutes"))) {
      return setAlertMessage("The end date must be at least 10 minutes from now");
    } else if (moment(endDate).isBefore(moment(startDate).add(5, "minutes"))) {
      return setAlertMessage("The end date must be at least 5 minutes after the start");
    }

    for (let qIdx = 0; qIdx < metadata.questions.length; qIdx++) {
      const question = metadata.questions[qIdx];
      if (!question.title.default.trim())
        return setAlertMessage("Please, enter a title for question " + (qIdx + 1));

      for (let cIdx = 0; cIdx < question.choices.length; cIdx++) {
        const choice = question.choices[cIdx];
        if (!choice.title.default.trim())
          return setAlertMessage("Please, fill in all the choices for question " + (qIdx + 1));

        // Ensure values are unique and sequential
        question.choices[cIdx].value = cIdx;
      }
    }

    if (!tokenAddress || !tokenAddress.match(/^0x[0-9a-fA-F]{40}$/))
      return setAlertMessage("The token address is not valid");

    if (!wallet?.account)
      return setAlertMessage("In order to continue, you need to use a Web3 provider like MetaMask");

    // FINAL CONFIRMATION
    if (
      !confirm(
        "You are about to create a new governance process. The process cannot be altered, paused or canceled.\n\nDo you want to continue?"
      )
    )
      return;

    // Continue
    try {
      setSubmitting(true);
      const pool = await poolPromise;

      // Estimate start/end blocks
      const [startBlock, endBlock] = await Promise.all([
        VotingApi.estimateBlockAtDateTime(startDate, pool),
        VotingApi.estimateBlockAtDateTime(endDate, pool),
      ]);
      const blockCount = endBlock - startBlock;

      const evmBlockHeight = await pool.provider.getBlockNumber();

      const { balanceMappingPosition } = await CensusErc20Api.getTokenInfo(tokenAddress, pool);
      const { proof } = await CensusErc20Api.generateProof(
        tokenAddress,
        [balanceMappingPosition.toString()],
        evmBlockHeight,
        pool.provider as providers.JsonRpcProvider
      );

      const processParamsPre: Omit<Omit<IProcessCreateParams, "metadata">, "questionCount"> & {
        metadata: ProcessMetadata;
      } = {
        mode: ProcessMode.make({ autoStart: true }),
        envelopeType: ProcessEnvelopeType.make({ encryptedVotes: envelopeType.hasEncryptedVotes }), // bit mask
        censusOrigin: ProcessCensusOrigin.ERC20,
        metadata: metadata,
        censusRoot: proof.storageHash,
        startBlock,
        blockCount,
        maxCount: metadata.questions.length,
        maxValue: findMaxValue(metadata),
        maxTotalCost: 0,
        costExponent: 10000,
        maxVoteOverwrites: 1,
        tokenAddress,
        sourceBlockHeight: evmBlockHeight,
        paramsSignature: "0x0000000000000000000000000000000000000000000000000000000000000000",
      };

      const processId = await VotingApi.newProcess(processParamsPre, signer, pool);
      Router.push("/processes#/" + processId);
      setSubmitting(false);

      setAlertMessage("The governance process has been successfully created");
    } catch (err) {
      setSubmitting(false);

      console.error(err);
      setAlertMessage("The governance process could not be created");
    }
  };

  return (
    <div>
      <SectionTitle
        title="New governance process"
        subtitle="Enter the details of a new governance process and submit
                them."
      />
      <NewProcessContainer>
        <FieldRow>
          <FieldRowLeftSection>
            <SectionTitle
              title="Proposal Title"
              subtitle="Short name to identify the process"
              smallerTitle
            />
            <TextInput
              placeholder="Title"
              onChange={(e) => setMainTitle(e.target.value)}
              value={metadata.title.default}
              widthValue={735}
            />
          </FieldRowLeftSection>
          <FieldRowRightSection marginTop={125}>
            <div style={{ float: "left" }}>
              <RadioChoice onClick={() => setEncryptedVotes(false)}>
                {" "}
                <input
                  type="radio"
                  readOnly
                  checked={!envelopeType.hasEncryptedVotes}
                  name="vote-encryption"
                />
                <div className="checkmark"></div> Real time results
              </RadioChoice>
              <RadioChoice onClick={() => setEncryptedVotes(true)}>
                {" "}
                <input
                  type="radio"
                  readOnly
                  checked={envelopeType.hasEncryptedVotes}
                  name="vote-encryption"
                />
                <div className="checkmark"></div> Encrypted results
              </RadioChoice>
            </div>
            <Tooltip />
          </FieldRowRightSection>
        </FieldRow>

        <FieldRow>
          <FieldRowLeftSection>
            <SectionTitle
              title="Description"
              subtitle="An introduction of about 2-3 lines"
              smallerTitle
            />
            <DescriptionInput
              placeholder="Description"
              onChange={(e) => setMainDescription(e.target.value)}
              value={metadata.description.default}
            />
          </FieldRowLeftSection>

          <FieldRowRightSection marginTop={140}>
            <Datetime
              value={startDate}
              inputProps={{
                placeholder: "Start date (d/m/y h:m)",
              }}
              isValidDate={(cur: Moment) => isValidFutureDate(cur)}
              dateFormat="D/MM/YYYY"
              timeFormat="HH:mm[h]"
              onChange={(date) => onStartDate(date)}
              strictParsing
            />
            <Datetime
              value={endDate}
              inputProps={{ placeholder: "End date (d/m/y h:m)" }}
              isValidDate={(cur: Moment) => isValidFutureDate(cur)}
              dateFormat="D/MM/YYYY"
              timeFormat="HH:mm[h]"
              onChange={(date) => onEndDate(date)}
              strictParsing
            />
          </FieldRowRightSection>
        </FieldRow>

        {metadata.questions.map((question, qIdx) => (
          <div key={qIdx}>
            <RowQuestions>
              <RowQuestionLeftSection>
                <QuestionNumber>Question {qIdx + 1}</QuestionNumber>
                <QuestionText>Question</QuestionText>
                <RemoveButton marginTop={-57}>
                  {qIdx > 0 ? <MinusContainer onClick={() => onRemoveQuestion(qIdx)} /> : null}
                </RemoveButton>
                <TextInput
                  placeholder="Title"
                  value={question.title.default}
                  onChange={(ev) => setQuestionTitle(qIdx, ev.target.value)}
                  widthValue={735}
                />

                <SectionTitle title="Description" smallerTitle />
                <DescriptionInput
                  placeholder="Description"
                  value={question.description.default}
                  onChange={(ev) => setQuestionDescription(qIdx, ev.target.value)}
                />
              </RowQuestionLeftSection>
              <RowQuestionRightSection />
            </RowQuestions>
            <div>
              <SectionTitle title="Choices" smallerTitle />
              {question.choices.map((choice, cIdx) => (
                <RowQuestions key={cIdx}>
                  <RowQuestionLeftSection>
                    <TextInput
                      placeholder="Choice"
                      value={choice.title.default}
                      onChange={(ev) => setChoiceText(qIdx, cIdx, ev.target.value)}
                      widthValue={683}
                    />
                  </RowQuestionLeftSection>
                  <ChoiceRightSection>
                    <PlusBox
                      onClick={handleChoice}
                      currentChoice={cIdx}
                      choices={question.choices}
                      currentQuestion={qIdx}
                    />
                  </ChoiceRightSection>
                </RowQuestions>
              ))}
            </div>

            {qIdx == metadata.questions.length - 1 ? (
              <SecondaryButton onClick={onAddQuestion}>Add question</SecondaryButton>
            ) : null}
          </div>
        ))}

        <RowContinue>
          {wallet.status === "connected" ? (
            <SubmitButton submitting={submitting} onSubmit={onSubmit} />
          ) : !isMobile ? (
            <ConnectButton />
          ) : null}
        </RowContinue>
      </NewProcessContainer>
    </div>
  );
};

function isValidFutureDate(date: Moment): boolean {
  const threshold = new Date(Date.now() - 1000 * 60 * 60 * 24);
  return date.isAfter(threshold);
}

export default NewProcessPage;
