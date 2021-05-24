import React, { useState } from "react";
import {
  IProcessCreateParams,
  ProcessCensusOrigin,
  ProcessEnvelopeType,
  ProcessMetadata,
  ProcessMode,
  VotingApi,
} from "dvote-js";
import styled from "styled-components";
import { usePool } from "@vocdoni/react-hooks";
import { useWallet } from "use-wallet";
import { ProcessMetadataTemplate } from "dvote-js";
import Datetime from "react-datetime";
import { Moment } from "moment";
import Router, { useRouter } from "next/router";
import Spinner from "react-svg-spinner";

import { PrimaryButton, SecondaryButton } from "../../components/button";
import { useMessageAlert } from "../../lib/hooks/message-alert";
import RadioChoice from "../../components/radio";
import { useIsMobile } from "../../lib/hooks/useWindowSize";
import { validateProposal } from "../../lib/processValidator";
import { useSigner } from "../../lib/hooks/useSigner";
import { ConnectButton } from "../../components/connect-button";
import { PlusBox, MinusContainer } from "../../components/plusBox";
import SectionTitle from "../../components/sectionTitle";
import { TextInput, DescriptionInput } from "../../components/input";
import Tooltip from "../../components/tooltip";

import { findMaxValue } from "../../lib/utils";
import { useToken } from "../../lib/hooks/tokens";
import { ETH_BLOCK_HEIGHT_PADDING } from "../../lib/constants";
import { getProof, waitUntilProcessCreated } from "../../lib/api";
import { NO_TOKEN_BALANCE } from "../../lib/errors";

import { useIsWide } from "../../lib/hooks/useWindowSize";

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

const ProposalRow = styled.div`
  display: flex;
  justify-content: start;
  flex-wrap: wrap;
  @media ${({ theme }) => theme.screens.tablet} {
    margin-top: 0;
    flex-direction: column;
  }

  @media ${({ theme }) => theme.screens.mobileL} {
    width: 100%;
    margin-top: 0;
    flex-direction: column;
  }
`;

const FieldRowLeftSection = styled.div`
  max-width: 680px;
  margin-right: 13px;
  & > :first-child {
    margin-top: 0px;
  }
`;

const FieldRowRightSection = styled.div<{ marginTop: number; isLarge: boolean }>`
  width: 480px;
  margin-top: ${({ marginTop, isLarge }) => (isLarge ? 45 : marginTop)}px;
  padding: 14px 24px 29px 24px;
  box-shadow: ${({ theme }) => theme.shadows.cardShadow};
  border-radius: 13px;
  background: ${({ theme }) => theme.blackAndWhite.w1};
  box-sizing: border-box;
  @media ${({ theme }) => theme.screens.tablet} {
    margin-right: 13px;
    width: 100%;
    margin-top: 25px;
    margin-left: 0;
  }
  @media ${({ theme }) => theme.screens.mobileL} {
    margin-right: 13px;
    width: 100%;
    margin-top: 25px;
    margin-left: 0;
  }
`;

const RightSectionTitle = styled.p`
  font-weight: 500;
  margin-bottom: 9px;
  line-height: 150%;
  text-align: left;

  @media ${({ theme }) => theme.screens.tablet} {
    font-size: 18px;
  }

  @media ${({ theme }) => theme.screens.mobileL} {
    font-size: 18px;
  }
`;

const RemoveButton = styled.div<{ marginTop: number }>`
  flex: 35%;
  margin-left: 6.5em;
  margin-top: ${({ marginTop }) => marginTop}px;
  @media ${({ theme }) => theme.screens.tablet} {
    margin-top: 25px;
  }
`;

const RowQuestions = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
`;

const RowQuestionLeftSection = styled.div`
  flex: 6;
  width: 680px;
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
  flex: 20;
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
  @media ${({ theme }) => theme.screens.tablet} {
    margin-bottom: 30px;
  }
`;

const InputBox = styled.div`
  display: flex;
  margin-bottom: 30px;
`;

const dateTimeStyle = {
  width: "100%",
  border: "2px solid #EFF1F7",
  boxSizing: "border-box",
  boxShadow: "inset 0px 2px 3px rgba(180, 193, 228, 0.35)",
  borderRadius: "8px",
  marginTop: "0px",
  marginBottom: "14px",
};

const WidthControlInput = styled(TextInput)<{ widthValue?: number }>`
  max-width: 680px;
  width: ${({ widthValue }) => (widthValue ? widthValue + "px" : "100%")};
  min-width: ${({ widthValue }) => (widthValue ? widthValue - 265 + "px" : "100%")};

  @media ${({ theme }) => theme.screens.tablet} {
    display: flex;
    min-width: 100%;
    margin-bottom: 9px;
    width: 100%;
  }
`;

const WidthControlDescription = styled(DescriptionInput)<{ widthValue?: number }>`
  max-width: 680px;
  width: ${({ widthValue }) => (widthValue ? widthValue + "px" : "100%")};
  min-width: 680px;

  @media ${({ theme }) => theme.screens.tablet} {
    margin-left: 0;
    margin-top: 10px;
    display: flex;
    width: 100%;
    min-width: 100%;
  }
`;

const SubmitButton = ({ submitting, onSubmit }) =>
  submitting ? (
    <p>
      Please wait...
      <Spinner />
    </p>
  ) : (
    <PrimaryButton wide onClick={onSubmit}>
      Create proposal
    </PrimaryButton>
  );

const NewProcessPage = () => {
  const { poolPromise } = usePool();
  const signer = useSigner();
  const wallet = useWallet();

  const isMobile = useIsMobile();
  const isLarge = useIsWide();

  const [metadata, setMetadata] = useState<ProcessMetadata>(
    JSON.parse(JSON.stringify(ProcessMetadataTemplate))
  );
  const [envelopeType, setEnvelopeType] = useState(new ProcessEnvelopeType(0));
  const [startDate, setStartDate] = useState(null as Date);
  const [endDate, setEndDate] = useState(null as Date);
  const router = useRouter();
  const tokenAddress = router.query.address as string;
  const [pType, setPType] = useState(router.query.type as string);
  const { tokenInfo, loading: tokenLoading, error: tokenError } = useToken(tokenAddress);
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
      validateProposal(metadata, startDate, endDate);
    } catch (error) {
      return setAlertMessage(error.message);
    }

    if (!tokenAddress || !tokenAddress.match(/^0x[0-9a-fA-F]{40}$/))
      return setAlertMessage("The token address is not valid");

    if (!wallet?.account)
      return setAlertMessage("In order to continue, you need to use a Web3 provider like MetaMask");

    // FINAL CONFIRMATION
    if (
      !confirm(
        "You are about to create a new proposal. The proposal cannot be altered, paused or canceled.\n\nDo you want to continue?"
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

      // Note: The process and the proof need to be created from the same exact `sourceBlockHeight`
      // Otherwise, proofs will not match
      const sourceBlockHeight = (await pool.provider.getBlockNumber()) - ETH_BLOCK_HEIGHT_PADDING;
      const proof = await getProof({
        account: wallet.account,
        token: tokenInfo.address,
        block: sourceBlockHeight,
        balanceMappingPosition: tokenInfo.balanceMappingPosition,
        pool,
      });

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
        sourceBlockHeight,
        paramsSignature: "0x0000000000000000000000000000000000000000000000000000000000000000",
      };

      const processId = await VotingApi.newProcess(processParamsPre, signer, pool);

      // Wait until effectively created
      const ready = await waitUntilProcessCreated(processId, tokenInfo.address, pool);
      if (!ready) throw new Error("The proposal is not available after a while");

      Router.push("/processes#/" + processId);
      setSubmitting(false);

      setAlertMessage("The proposal has been successfully created", "success");
    } catch (err) {
      setSubmitting(false);

      if (err?.message == NO_TOKEN_BALANCE) {
        return setAlertMessage(NO_TOKEN_BALANCE);
      }

      console.error(err);
      setAlertMessage("The proposal could not be created");
    }
  };

  return (
    <div>
      <NewProcessContainer>
        <ProposalRow>
          <FieldRowLeftSection>
            <SectionTitle
              title="New proposal"
              subtitle="Enter the details of a new proposal and submit
                them."
            />
            <SectionTitle title="Title" subtitle="Identify your proposal" smallerTitle />
            <InputBox>
              <WidthControlInput
                placeholder="Title"
                onChange={(e) => setMainTitle(e.target.value)}
                value={metadata.title.default}
                widthValue={680}
              />
            </InputBox>
            <SectionTitle
              title="Description"
              subtitle="An introduction of about 2-3 lines"
              smallerTitle
            />
            <DescriptionInput
              placeholder="Description"
              onChange={(e) => setMainDescription(e.target.value)}
              value={metadata.description.default}
              widthValue={680}
            />
          </FieldRowLeftSection>
          <FieldRowRightSection marginTop={60} isLarge={isLarge}>
            <RightSectionTitle>Proposal Type</RightSectionTitle>
            <RadioChoice onClick={() => setPType("binding")}>
              {" "}
              {console.log("pType? " + pType)}
              {console.log("is binding? " + pType === "binding")}
              {console.log("is signaling? " + pType === "signaling")}
              <input type="radio" readOnly checked={pType === "binding"} name="proposal-type" />
              <div className="checkmark"></div> Binding proposal
            </RadioChoice>
            <RadioChoice onClick={() => setPType("signaling")}>
              {" "}
              <input type="radio" readOnly checked={pType === "signaling"} name="proposal-type" />
              <div className="checkmark"></div> Signaling proposal
            </RadioChoice>
            <RightSectionTitle>Results</RightSectionTitle>
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
            {/* TODO rework the tooltip, s.t. break are not needed and title spacing is even */}
            <Tooltip />
            <br style={{ height: "0px" }} /> {/* can't get the title to left-align without break */}
            <RightSectionTitle>Proposal date</RightSectionTitle>
            <Datetime
              value={startDate}
              inputProps={{
                placeholder: "Start date (d/m/y h:m)",
                style: dateTimeStyle,
              }}
              isValidDate={(cur: Moment) => isValidFutureDate(cur)}
              dateFormat="D/MM/YYYY"
              timeFormat="HH:mm[h]"
              onChange={(date) => onStartDate(date)}
              strictParsing
            />
            <Datetime
              value={endDate}
              inputProps={{
                placeholder: "End date (d/m/y h:m)",
                style: dateTimeStyle,
              }}
              isValidDate={(cur: Moment) => isValidFutureDate(cur)}
              dateFormat="D/MM/YYYY"
              timeFormat="HH:mm[h]"
              onChange={(date) => onEndDate(date)}
              strictParsing
            />
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                marginTop: "13px",
                width: "100%",
              }}
            >
              {wallet.status === "connected" ? (
                <SubmitButton submitting={submitting} onSubmit={() => onSubmit()} />
              ) : !isMobile ? (
                <ConnectButton wide />
              ) : null}
            </div>
          </FieldRowRightSection>
        </ProposalRow>

        {metadata.questions.map((question, qIdx) => (
          <div key={qIdx}>
            <RowQuestions>
              <RowQuestionLeftSection>
                <QuestionNumber>Question {qIdx + 1}</QuestionNumber>
                <QuestionText>Question</QuestionText>
                <RemoveButton marginTop={-57}>
                  {qIdx > 0 ? <MinusContainer onClick={() => onRemoveQuestion(qIdx)} /> : null}
                </RemoveButton>
                <InputBox>
                  <WidthControlInput
                    placeholder="Title"
                    value={question.title.default}
                    onChange={(ev) => setQuestionTitle(qIdx, ev.target.value)}
                    widthValue={680}
                  />
                </InputBox>

                <SectionTitle title="Description" smallerTitle />
                <InputBox>
                  <WidthControlDescription
                    placeholder="Description"
                    value={question.description.default}
                    onChange={(ev) => setQuestionDescription(qIdx, ev.target.value)}
                    widthValue={660}
                  />
                </InputBox>
              </RowQuestionLeftSection>
              <RowQuestionRightSection />
            </RowQuestions>
            <div>
              <SectionTitle title="Choices" smallerTitle />
              {question.choices.map((choice, cIdx) => (
                <RowQuestions key={cIdx}>
                  <RowQuestionLeftSection>
                    <WidthControlInput
                      placeholder="Choice"
                      value={choice.title.default}
                      onChange={(ev) => setChoiceText(qIdx, cIdx, ev.target.value)}
                      widthValue={627}
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
      </NewProcessContainer>
    </div>
  );
};

function isValidFutureDate(date: Moment): boolean {
  const threshold = new Date(Date.now() - 1000 * 60 * 60 * 24);
  return date.isAfter(threshold);
}

export default NewProcessPage;
