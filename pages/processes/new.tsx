import { CSSProperties, useState } from "react";
import {
    CensusErc20Api,
    IProcessCreateParams,
    MultiLanguage,
    ProcessCensusOrigin,
    ProcessContractParameters,
    ProcessEnvelopeType,
    ProcessMetadata,
    ProcessMode,
    VotingApi,
} from "dvote-js";
import styled from "styled-components";
import { usePool, useSigner } from "@vocdoni/react-hooks";
import { useUrlHash } from "use-url-hash";
import { useWallet } from "use-wallet";
import { ProcessMetadataTemplate } from "dvote-js";
import Datetime from "react-datetime";
import moment, { Moment } from "moment";
import Router from "next/router";
import Spinner from "react-svg-spinner";
import { providers } from "ethers";

import Button from "../../components/button";
import { useMessageAlert } from "../../lib/hooks/message-alert";
import { TopSection } from "../../components/top-section";

const NewProcessContainer = styled.div`
    input[type="text"],
    textarea {
        border: none;
        background-color: ${({ theme }) => theme.inputBackground};
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
    flex-direction: row;
    justify-content: space-between;
`;

const FieldRowLeftSection = styled.div`
    flex: 6;
`;

const FieldRowRightSection = styled.div`
    flex: 4;
    padding-left: 2em;
    margin-top: ${({ marginTop }: CSSProperties) => marginTop}px;
`;

const RowQuestions = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: space-between;
`;

const RowQuestionLeftSection = styled.div`
    flex: 6;
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
    flex: 4;
    padding-left: 2em;
    display: flex;
    flex-direction: column;
    justify-content: center;

    @media ${({ theme }) => theme.screens.tablet} {
        flex: 0;
    }
`;

const InfoTitle = styled.h2`
    margin-bottom: 5px;
`;

const InfoPlaceholder = styled.div`
    color: ${({ theme }) => theme.lightText};
`;

const ChoicesTitle = styled.h3`
    margin-top: 1em;
    margin-bottom: 0;
`;

/* const plusbox = `
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    font-weight: 500;
    background-color: ${({ theme }) => theme.inputBackground};
    margin-top: 1em;
    border-radius: 8px;
    width: calc(15px + 2em);
    height: calc(15px + 2em);
    text-align: center;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
`;

const add = `
    cursor: pointer;
    background: ${({ theme }) => theme.accent2 + "0C"};
    border: 1px solid ${({ theme }) => theme.accent2};
    color: ${({ theme }) => theme.accent2};
    width: calc(15px + 2em - 2px);
    height: calc(15px + 2em - 2px);
    &:hover {
        background: ${({ theme }) => theme.accent2 + "1A"};
    }
    &:active {
        background: ${({ theme }) => theme.accent2 + "27"};
    }
`;

const remove = `
    cursor: pointer;
    background: ${({ theme }) => theme.accent1 + "0C"};
    border: 1px solid ${({ theme }) => theme.accent1};
    color: ${({ theme }) => theme.accent1};
    width: calc(15px + 2em - 2px);
    height: calc(15px + 2em - 2px);
    &:hover {
        background: ${({ theme }) => theme.accent1 + "1A"};
    }
    &:active {
        background: ${({ theme }) => theme.accent1 + "27"};
    }
`; */

// @TODO: Apply DRY with these three PlusBox divs
const PlusBoxContainer = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    font-weight: 500;
    background-color: ${({ theme }) => theme.inputBackground};
    margin-top: 1em;
    border-radius: 8px;
    width: calc(15px + 2em);
    height: calc(15px + 2em);
    text-align: center;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
`;

const PlusBoxAdd = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    font-weight: 500;
    background-color: ${({ theme }) => theme.inputBackground};
    margin-top: 1em;
    border-radius: 8px;
    width: calc(15px + 2em);
    height: calc(15px + 2em);
    text-align: center;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;

    cursor: pointer;
    background: ${({ theme }) => theme.accent2 + "0C"};
    border: 1px solid ${({ theme }) => theme.accent2};
    color: ${({ theme }) => theme.accent2};
    width: calc(15px + 2em - 2px);
    height: calc(15px + 2em - 2px);
    &:hover {
        background: ${({ theme }) => theme.accent2 + "1A"};
    }
    &:active {
        background: ${({ theme }) => theme.accent2 + "27"};
    }
`;

const PlusBoxRemove = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    font-weight: 500;
    background-color: ${({ theme }) => theme.inputBackground};
    margin-top: 1em;
    border-radius: 8px;
    width: calc(15px + 2em);
    height: calc(15px + 2em);
    text-align: center;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;

    cursor: pointer;
    background: ${({ theme }) => theme.accent1 + "0C"};
    border: 1px solid ${({ theme }) => theme.accent1};
    color: ${({ theme }) => theme.accent1};
    width: calc(15px + 2em - 2px);
    height: calc(15px + 2em - 2px);
    &:hover {
        background: ${({ theme }) => theme.accent1 + "1A"};
    }
    &:active {
        background: ${({ theme }) => theme.accent1 + "27"};
    }
`;

const RadioChoice = styled.label`
    cursor: pointer;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
    padding: 5px 0;
    font-weight: 500;
    color: var(--main-text);

    display: flex;
    flex-direction: row;
    align-items: center;

    /* Hide the browser's default radio button */
    input {
        position: absolute;
        opacity: 0;
        cursor: pointer;
    }

    /* Create a custom radio button */
    .checkmark {
        height: 22px;
        width: 22px;
        background-color: ${({ theme }) => theme.clear};
        border-radius: 50%;
        margin-right: 1em;
        border: 1px solid ${({ theme }) => theme.accent1};
    }

    /* When the radio button is checked, add a blue background */
    input:checked ~ .checkmark {
        background-color: ${({ theme }) => theme.clear};
    }

    /* Create the indicator (the dot/circle - hidden when not checked) */
    .checkmark:after {
        content: "";
        position: absolute;
        display: none;
    }

    /* Show the indicator (dot/circle) when checked */
    input:checked ~ .checkmark:after {
        display: block;
    }

    /* Style the indicator (dot/circle) */
    .checkmark:after {
        border-radius: 50%;
        background: ${({ theme }) => theme.accent1};
        z-index: 50;
        height: 16px;
        width: 16px;
        margin: 3px;
    }
`;

const QuestionNumber = styled.h6`
    color: ${({ theme }) => theme.accent1};
    margin-bottom: 0;
`;

const QuestionText = styled.h3`
    margin-top: 1em;
    margin-bottom: 0;
`;

const AddQuestionButton = styled.div`
    margin-top: 1em;
    border-radius: 8px;

    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    font-weight: 500;

    cursor: pointer;
    background: ${({ theme }) => theme.accent2}0C;
    border: 1px solid ${({ theme }) => theme.accent2};
    color: ${({ theme }) => theme.accent2};

    width: 180px;
    height: calc(15px + 2em - 2px);

    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;

    &:hover {
        background: ${({ theme }) => theme.accent2}1A;
    }

    &:active {
        background: ${({ theme }) => theme.accent2}27;
    }
`;

const SubmitButton = styled(Button.Styled)`
    background: ${({ theme }) => theme.accent2}0C;
    color: ${({ theme }) => theme.accent2};
    border: 1px solid ${({ theme }) => theme.accent2};

    &:hover {
        background: ${({ theme }) => theme.accent2}1A;
    }

    &:active {
        background: ${({ theme }) => theme.accent2}27;
    }

    @media ${({ theme }) => theme.screens.tablet} {
        margin-top: 10px;
    }
`;

const RowContinue = styled.div`
    margin-top: 5em;

    display: flex;
    justify-content: space-around;

    & > * {
        min-width: 250px;
    }
`;

interface PlusBoxProps {
    currentChoice: number;
    choices: Array<{
        title: MultiLanguage<string>;
        value: number;
    }>;
    currentQuestion: number;
}

const PlusBox = ({
    currentChoice,
    choices,
    currentQuestion,
    onClick,
}: PlusBoxProps & { onClick: (params: PlusBoxProps) => void }) => {
    const lastChoice = choices.length - 1;
    const isDefault = choices[currentChoice].title.default;

    let Box = PlusBoxRemove;
    if (currentChoice === lastChoice && isDefault) {
        Box = PlusBoxAdd;
    } else if (choices.length === 2) {
        Box = PlusBoxContainer;
    }

    return (
        <Box
            onClick={() => onClick({ currentQuestion, choices, currentChoice })}
        >
            {currentChoice === lastChoice && isDefault ? "+" : "⨯"}
        </Box>
    );
};

// MAIN COMPONENT
const NewProcessPage = () => {
    const { poolPromise } = usePool();
    const signer = useSigner();
    const wallet = useWallet();
    const [metadata, setMetadata] = useState<ProcessMetadata>(
        JSON.parse(JSON.stringify(ProcessMetadataTemplate))
    );
    const [envelopeType, setEnvelopeType] = useState(
        new ProcessEnvelopeType(0)
    );
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
        metadata.questions.push(
            JSON.parse(JSON.stringify(ProcessMetadataTemplate.questions[0]))
        );
        setMetadata(Object.assign({}, metadata));
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
        if (!metadata.title || metadata.title.default.trim().length < 2)
            return setAlertMessage("Please enter a title");
        else if (metadata.title.default.trim().length > 50)
            return setAlertMessage("Please enter a shorter title");

        if (
            !metadata.description ||
            metadata.description.default.trim().length < 2
        )
            return setAlertMessage("Please enter a description");
        else if (metadata.description.default.trim().length > 300)
            return setAlertMessage("Please enter a shorter description");

        if (!startDate) return setAlertMessage("Please, enter a start date");
        else if (!endDate)
            return setAlertMessage("Please, enter an ending date");

        if (moment(startDate).isBefore(moment().add(5, "minutes"))) {
            return setAlertMessage(
                "The start date must be at least 5 minutes from now"
            );
        } else if (moment(endDate).isBefore(moment().add(10, "minutes"))) {
            return setAlertMessage(
                "The end date must be at least 10 minutes from now"
            );
        } else if (
            moment(endDate).isBefore(moment(startDate).add(5, "minutes"))
        ) {
            return setAlertMessage(
                "The end date must be at least 5 minutes after the start"
            );
        }

        for (let qIdx = 0; qIdx < metadata.questions.length; qIdx++) {
            const question = metadata.questions[qIdx];
            if (!question.title.default.trim())
                return setAlertMessage(
                    "Please, enter a title for question " + (qIdx + 1)
                );

            for (let cIdx = 0; cIdx < question.choices.length; cIdx++) {
                const choice = question.choices[cIdx];
                if (!choice.title.default.trim())
                    return setAlertMessage(
                        "Please, fill in all the choices for question " +
                            (qIdx + 1)
                    );

                // Ensure values are unique and sequential
                question.choices[cIdx].value = cIdx;
            }
        }

        if (!tokenAddress || !tokenAddress.match(/^0x[0-9a-fA-F]{40}$/))
            return setAlertMessage("The token address it not valid");

        if (!wallet?.account)
            return setAlertMessage(
                "In order to continue, you need to use a Web3 provider like MetaMask"
            );

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

            // Fetch EMV proof
            const holderAddress = await signer.getAddress();
            const tokenBalanceMappingPosition = await CensusErc20Api.getBalanceMappingPosition(
                tokenAddress,
                pool
            );

            const evmBlockHeight = await pool.provider.getBlockNumber();
            const balanceSlot = CensusErc20Api.getHolderBalanceSlot(
                holderAddress,
                tokenBalanceMappingPosition.toNumber()
            );
            const { proof } = await CensusErc20Api.generateProof(
                tokenAddress,
                [balanceSlot],
                evmBlockHeight,
                pool.provider as providers.JsonRpcProvider
            );

            const processParamsPre: Omit<
                Omit<IProcessCreateParams, "metadata">,
                "questionCount"
            > & { metadata: ProcessMetadata } = {
                mode: ProcessMode.make({ autoStart: true }),
                envelopeType: ProcessEnvelopeType.make({}), // bit mask
                censusOrigin: ProcessCensusOrigin.ERC20,
                metadata: metadata,
                censusRoot: proof.storageHash,
                startBlock,
                blockCount,
                maxCount: 1,
                maxValue: 3,
                maxTotalCost: 0,
                costExponent: 10000,
                maxVoteOverwrites: 1,
                evmBlockHeight,
                tokenAddress,
                namespace: 0,
                paramsSignature:
                    "0x0000000000000000000000000000000000000000000000000000000000000000",
            };

            const processId = await VotingApi.newProcess(
                processParamsPre,
                signer,
                pool
            );
            Router.push("/processes#/" + processId);
            setSubmitting(false);

            setAlertMessage(
                "The governance process has been successfully created"
            );
        } catch (err) {
            setSubmitting(false);

            console.error(err);
            setAlertMessage("The governance process could not be created");
        }
    };

    return (
        <NewProcessContainer>
            <TopSection
                title="New governance process"
                description="Enter the details of a new governance process and submit
                them."
            />

            <FieldRow>
                <FieldRowLeftSection>
                    <InfoTitle>Title</InfoTitle>
                    <InfoPlaceholder>
                        Short name to identify the process
                    </InfoPlaceholder>
                    <input
                        type="text"
                        placeholder="Title"
                        onChange={(e) => setMainTitle(e.target.value)}
                        value={metadata.title.default}
                    />
                </FieldRowLeftSection>
                <FieldRowRightSection marginTop={70}>
                    <RadioChoice onClick={() => setEncryptedVotes(false)}>
                        {" "}
                        <input
                            type="radio"
                            readOnly
                            checked={!envelopeType.hasEncryptedVotes}
                            name="vote-encryption"
                        />
                        <div className="checkmark"></div> Real-time results
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
                </FieldRowRightSection>
            </FieldRow>

            <FieldRow>
                <FieldRowLeftSection>
                    <InfoTitle>Description</InfoTitle>
                    <InfoPlaceholder>
                        An introduction of about 2-3 lines
                    </InfoPlaceholder>
                    <textarea
                        placeholder="Description"
                        onChange={(e) => setMainDescription(e.target.value)}
                        value={metadata.description.default}
                    />
                </FieldRowLeftSection>
                <FieldRowRightSection marginTop={82}>
                    <div>
                        <Datetime
                            value={startDate}
                            inputProps={{
                                placeholder: "Start date (d/m/y h:m)",
                            }}
                            isValidDate={(cur: Moment) =>
                                isValidFutureDate(cur)
                            }
                            dateFormat="D/MM/YYYY"
                            timeFormat="HH:mm[h]"
                            onChange={(date) => onStartDate(date)}
                            strictParsing
                        />
                        <Datetime
                            value={endDate}
                            inputProps={{ placeholder: "End date (d/m/y h:m)" }}
                            isValidDate={(cur: Moment) =>
                                isValidFutureDate(cur)
                            }
                            dateFormat="D/MM/YYYY"
                            timeFormat="HH:mm[h]"
                            onChange={(date) => onEndDate(date)}
                            strictParsing
                        />
                    </div>
                </FieldRowRightSection>
            </FieldRow>

            {metadata.questions.map((question, qIdx) => (
                <div key={qIdx}>
                    <RowQuestions>
                        <RowQuestionLeftSection>
                            <QuestionNumber>Question {qIdx + 1}</QuestionNumber>
                            <QuestionText>Question</QuestionText>
                            <input
                                type="text"
                                placeholder="Title"
                                value={question.title.default}
                                onChange={(ev) =>
                                    setQuestionTitle(qIdx, ev.target.value)
                                }
                            />

                            <QuestionText>Description</QuestionText>
                            <textarea
                                placeholder="Description"
                                value={question.description.default}
                                onChange={(ev) =>
                                    setQuestionDescription(
                                        qIdx,
                                        ev.target.value
                                    )
                                }
                            />
                        </RowQuestionLeftSection>
                        <RowQuestionRightSection />
                    </RowQuestions>
                    <div>
                        <ChoicesTitle>Choices</ChoicesTitle>
                        {question.choices.map((choice, cIdx) => (
                            <RowQuestions key={cIdx}>
                                <RowQuestionLeftSection>
                                    <input
                                        type="text"
                                        placeholder="Choice"
                                        value={choice.title.default}
                                        onChange={(ev) =>
                                            setChoiceText(
                                                qIdx,
                                                cIdx,
                                                ev.target.value
                                            )
                                        }
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
                        <AddQuestionButton onClick={onAddQuestion}>
                            Add question
                        </AddQuestionButton>
                    ) : null}
                </div>
            ))}

            <RowContinue>
                {submitting ? (
                    <p className="status">
                        Please wait...
                        <Spinner />
                    </p>
                ) : (
                    <SubmitButton onClick={onSubmit}>
                        Submit process
                    </SubmitButton>
                )}
            </RowContinue>
        </NewProcessContainer>
    );
};

function isValidFutureDate(date: Moment): boolean {
    const threshold = new Date(Date.now() - 1000 * 60 * 60 * 24);
    return date.isAfter(threshold);
}

export default NewProcessPage;
