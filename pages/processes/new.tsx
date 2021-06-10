import React, { CSSProperties, useEffect, useState } from "react";
import {
  DVoteGateway,
  GatewayPool,
  IProcessCreateParams,
  ProcessCensusOrigin,
  ProcessEnvelopeType,
  ProcessMetadata,
  ProcessMode,
  VotingApi,
  VotingOracleApi,
} from "dvote-js";
import styled from "styled-components";
import { usePool } from "@vocdoni/react-hooks";
import { useWallet } from "use-wallet";
import { ProcessMetadataTemplate } from "dvote-js";
import Datetime from "react-datetime";
import { Moment } from "moment";
import Router, { useRouter } from "next/router";
import Spinner from "react-svg-spinner";

import { useMessageAlert } from "../../lib/hooks/message-alert";
import { useIsMobile } from "../../lib/hooks/useWindowSize";
import { validateProposal } from "../../lib/processValidator";
import { useSigner } from "../../lib/hooks/useSigner";
import { findMaxValue } from "../../lib/utils";
import { useStoredTokens, useToken } from "../../lib/hooks/tokens";
import { ETH_BLOCK_HEIGHT_PADDING } from "../../lib/constants";
import { getProof, waitUntilProcessCreated } from "../../lib/api";
import { NO_TOKEN_BALANCE, USER_CANCELED_TX } from "../../lib/errors";
import { useIsWide } from "../../lib/hooks/useWindowSize";
import { FORTY_DIGITS_HEX } from "../../lib/regex";
import { EventType, trackEvent } from "../../lib/analytics";

import { PrimaryButton, SecondaryButton } from "../../components/button";
import { PlusBox, MinusContainer } from "../../components/plusBox";
import { RadioSection } from "../../components/radio";
import { ConnectButton } from "../../components/connect-button";
import SectionTitle from "../../components/sectionTitle";
import { TextInput, DescriptionInput } from "../../components/input";
import { Unless, When } from "react-if";

/* NOTE The option container does not fit on the right for small laptops. This is why the whole
layout is changed to a column for devices <= laptop. */
const FormContainer = styled.div`
  display: flex;
  width: 100%;

  @media ${({ theme }) => theme.screens.laptop} {
    margin-top: 0;
    flex-direction: column;
  }
`;

/* Contains the text-based input fields (like proposal and question description).
Again, additional breaks needed for laptop sizes. Size is hard-coded for large desktops,
flexible for laptops and full-width for tablets. */
const InformationSection = styled.div`
  width: 680px;
  margin-right: 16px;

  & > :first-child {
    margin-top: 0px;
  }
  @media ${({ theme }) => theme.screens.laptopL} {
    width: 65%;
  }
  @media ${({ theme }) => theme.screens.laptop} {
    margin-right: 13px;
    width: 100%;
    margin-top: 0;
    flex-direction: column;
  }
`;

/* Contains input for other settable parameters (like date, proposal types, etc). On
devices >= small laptop it contains a button labeled either "connect wallet" or "create
proposal". On devices <= tablets, the button is moved out of the box. If no wallet is
connected it is not shown (as there is the wallet button at the bottom of the page). If
the wallet is connected, the button is shown below the white box.*/
const OptionSection = styled.div<{ marginTop: number; isLarge: boolean }>`
  height: 600px;
  width: 480px;
  margin-left: 24px;
  margin-top: ${({ marginTop, isLarge }) => (isLarge ? 45 : marginTop)}px;
  padding: 14px 24px 29px 24px;
  box-shadow: ${({ theme }) => theme.shadows.cardShadow};
  border-radius: 13px;
  background: ${({ theme }) => theme.blackAndWhite.w1};
  box-sizing: border-box;

  @media ${({ theme }) => theme.screens.laptopL} {
    width: 33%;
    margin-left: 0;
  }
  @media ${({ theme }) => theme.screens.laptop} {
    height: 600px;
    width: 100%;
    margin-top: 25px;
    margin-left: 0;
  }
  @media ${({ theme }) => theme.screens.tablet} {
    height: 520px;
    margin-bottom: 24px;
  }
`;

const OptionSectionTitle = styled.p`
  font-weight: 500;
  margin-bottom: 9px;
  line-height: 150%;
  text-align: left;

  @media ${({ theme }) => theme.screens.tablet} {
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
  width: 100%;
  display: flex;
`;

const ChoiceRightSection = styled.div`
  width: 44px;
  margin-left: 13px;

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

  @media ${({ theme }) => theme.screens.tablet} {
    margin-bottom: 8px;
  }
`;

const dateTimeStyle: CSSProperties = {
  width: "100%",
  border: "2px solid #EFF1F7",
  boxSizing: "border-box",
  boxShadow: "inset 0px 2px 3px rgba(180, 193, 228, 0.35)",
  borderRadius: "8px",
  marginTop: "0px",
  marginBottom: "14px",
  padding: "1em",
};

const WidthControlInput = styled(TextInput)`
  @media ${({ theme }) => theme.screens.tablet} {
    display: flex;
    margin-bottom: 9px;
    width: 100%;
  }
`;

const QuestionDescription = styled(DescriptionInput)`
  width: 100%;
  border: none;
  background-color: ${({ theme }) => theme.blackAndWhite.w1};
  padding: 1em;
  border-radius: 8px;

  @media ${({ theme }) => theme.screens.tablet} {
    margin-left: 0;
    margin-top: 10px;
    display: flex;
    width: 100%;
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

enum ProcessTypes {
  SIGNALING,
  BINDING,
}

enum ResultTypes {
  NORMAL,
  ENCRYPTED,
}

const resultsTooltips = [
  "Results for the proposal are available during the voting process, meaning anyone can see where the voting is leaning to.",
  "Results for the proposal will be available only after voting is finished, meaning no one can see where the voting is leaning to before it is closed.",
];

const proposalsTooltips = [
  "Gasless proposal creation using Vochain layer 2 solution",
  "Metadata is stored on Ethereum, increasing decentralization and verifiability",
];

const NewProcessPage = () => {
  const { poolPromise } = usePool();
  const { storeTokens } = useStoredTokens();

  const signer = useSigner();
  const wallet = useWallet();
  const isConnected = wallet.connector || wallet.account;

  const router = useRouter();
  const tokenAddress = router.query.address as string;
  if (router.isReady && !tokenAddress) {
    /* TODO eventually push to NOT FOUND [VR 07-06-2021] */
    router.push("/");
  }
  const initProcessType: ProcessTypes =
    (router.query.type as string) === "binding" ? ProcessTypes.BINDING : ProcessTypes.SIGNALING;

  const isMobile = useIsMobile();
  const isLarge = useIsWide();

  const [metadata, setMetadata] = useState<ProcessMetadata>(
    JSON.parse(JSON.stringify(ProcessMetadataTemplate))
  );
  const [envelopeType, setEnvelopeType] = useState(new ProcessEnvelopeType(0));
  const [startDate, setStartDate] = useState(null as Date);
  const [endDate, setEndDate] = useState(null as Date);
  const [processType, setProcessType] = useState<ProcessTypes>(initProcessType);
  const [resultType, setResultType] = useState<ResultTypes>(ResultTypes.NORMAL);
  const { tokenInfo, loading: tokenLoading, error: tokenError } = useToken(tokenAddress);
  const [submitting, setSubmitting] = useState(false);
  const { setAlertMessage } = useMessageAlert();

  useEffect(() => {
    // NOTE If the router captures a change from this page to other pages it means that the
    // user has abandoned creating a proposal. However, if the next page is the new
    // proposal's page, it means the user has completed the proposal. In this case the
    // event is NOT triggered.
    function routeChangeHandler(url: string) {
      if (!url.includes("/processes/#/"))
        trackEvent(EventType.PROPOSAL_CREATION_ABANDONED, { entity_id: tokenAddress });
    }

    router.events.on("routeChangeStart", routeChangeHandler);
    return () => {
      router.events.off("routeChangeStart", routeChangeHandler);
    };
  });

  // CALLBACKS ===========================================================================

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
      return setAlertMessage(error?.message);
    }

    if (!tokenAddress || !tokenAddress.match(FORTY_DIGITS_HEX))
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

      const processId =
        processType === ProcessTypes.BINDING
          ? await submitBindingVote(pool, startBlock, blockCount)
          : await submitSignalingVote(pool, startBlock, blockCount);

      // Wait until effectively created
      const ready = await waitUntilProcessCreated(processId, pool);
      if (!ready) throw new Error("The proposal is not available after a while");

      setSubmitting(false);
      setAlertMessage("The proposal has been successfully created", "success");

      const analytics_properties = {
        entity_id: tokenAddress,
        proposal_id: processId,
        start: startDate,
        end: endDate,
        binding_type: processType === ProcessTypes.BINDING ? "binding" : "signaling",
        results_type: envelopeType.hasEncryptedVotes ? "encrypted" : "normal",
        questions_length: metadata.questions.length,
      };
      trackEvent(EventType.PROPOSAL_CREATED, analytics_properties);

      // Write to the local DB
      tokenInfo.processes.push(processId);
      storeTokens([tokenInfo]);

      Router.push("/processes#/" + processId);
    } catch (error) {
      setSubmitting(false);

      /* User cancels tx (e.g., by aborting signing process.) This is not registered as "failure"*/
      if ((error?.message as string)?.includes("signature")) {
        trackEvent(EventType.TX_CANCELED, { event_canceled: "creating_proposal" });
        return setAlertMessage(USER_CANCELED_TX);
      }

      if (error?.message == NO_TOKEN_BALANCE) return setAlertMessage(NO_TOKEN_BALANCE);
      if (error?.message?.indexOf?.("max proposals per address reached"))
        return setAlertMessage("You have hit the temporary limit of proposals");

      console.error(error);
      setAlertMessage("The proposal could not be created");
    }
  };

  async function submitSignalingVote(pool: GatewayPool, startBlock: number, blockCount: number) {
    const oracleClient = new DVoteGateway({
      uri: process.env.SIGNALING_ORACLE_URL,
      supportedApis: ["oracle"],
    });
    const sourceBlockHeight = (await pool.provider.getBlockNumber()) - ETH_BLOCK_HEIGHT_PADDING;

    const signalingProcessParams = {
      mode: ProcessMode.make({ autoStart: true }),
      envelopeType: ProcessEnvelopeType.make({
        encryptedVotes: envelopeType.hasEncryptedVotes,
      }), // bit mask
      censusOrigin: ProcessCensusOrigin.ERC20,
      metadata: metadata,
      startBlock: startBlock,
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
    return VotingOracleApi.newProcessErc20(signalingProcessParams, signer, pool, oracleClient);
  }

  async function submitBindingVote(pool: GatewayPool, startBlock: number, blockCount: number) {
    // Note: The process and the proof need to be created from the same exact `sourceBlockHeight`
    // Otherwise, proofs will not match.
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

    return VotingApi.newProcess(processParamsPre, signer, pool);
  }
  function onResultsTypeChange(index: number) {
    setResultType(index);
    if (index === ResultTypes.NORMAL) setEncryptedVotes(false);
    else setEncryptedVotes(true);
  }
  const radioLabelsProposals = ["Signaling proposal", "On-chain proposal"];
  const radioLabelsResults = ["Real time results", "Encrypted results"];

  return (
    <FormContainer>
      <InformationSection>
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
          />
        </InputBox>
        <SectionTitle
          title="Description"
          subtitle="An introduction of about 2-3 lines"
          smallerTitle
        />
        <QuestionDescription
          placeholder="Description"
          onChange={(e) => setMainDescription(e.target.value)}
          value={metadata.description.default}
        />
        {metadata.questions.map((question, qIdx) => (
          <>
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
              />
            </InputBox>

            <SectionTitle title="Description" smallerTitle />
            <InputBox>
              <QuestionDescription
                placeholder="Description"
                value={question.description.default}
                onChange={(ev) => setQuestionDescription(qIdx, ev.target.value)}
              />
            </InputBox>
            <SectionTitle title="Choices" smallerTitle />
            {question.choices.map((choice, cIdx) => (
              <RowQuestions key={cIdx}>
                <WidthControlInput
                  placeholder="Choice"
                  value={choice.title.default}
                  onChange={(ev) => setChoiceText(qIdx, cIdx, ev.target.value)}
                />
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
            {qIdx == metadata.questions.length - 1 ? (
              <SecondaryButton onClick={onAddQuestion}>Add question</SecondaryButton>
            ) : null}
          </>
        ))}
      </InformationSection>

      <OptionSection marginTop={60} isLarge={isLarge}>
        <OptionSectionTitle>Proposal Type</OptionSectionTitle>
        <RadioSection
          labels={radioLabelsProposals}
          tooltips={proposalsTooltips}
          state={processType}
          setState={setProcessType}
        />
        <OptionSectionTitle>Result Type</OptionSectionTitle>
        <RadioSection
          labels={radioLabelsResults}
          tooltips={resultsTooltips}
          state={resultType}
          setState={onResultsTypeChange}
        />
        <OptionSectionTitle>Proposal date</OptionSectionTitle>
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
          <Unless condition={isMobile}>
            {wallet.status === "connected" ? (
              <SubmitButton submitting={submitting} onSubmit={() => onSubmit()} />
            ) : (
              <ConnectButton wide />
            )}
          </Unless>
        </div>
      </OptionSection>
      <When condition={isMobile && isConnected}>
        <SubmitButton submitting={submitting} onSubmit={() => onSubmit()} />
      </When>
    </FormContainer>
  );
};

// HELPERS =============================================================================

function isValidFutureDate(date: Moment): boolean {
  const threshold = new Date(Date.now() - 1000 * 60 * 60 * 24);
  return date.isAfter(threshold);
}

export default NewProcessPage;
