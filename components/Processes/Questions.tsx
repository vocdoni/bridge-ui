import React from "react";

import {
  QuestionContainer,
  QuestionDescription,
  QuestionInformation,
  QuestionNumber,
  QuestionOptionsFew,
  QuestionTitle,
  OptionSubtitle,
  OptionLabel,
  OptionTitleContainer,
  OptionTitle,
  ChoiceInfo,
  Percentage,
  QuestionOptionsMany,
  QuestionOptions,
} from "./styled";

import Checkbox from "./checkbox";
import { ProcessMetadata } from "dvote-js";
import { ProcessResults } from "../../lib/hooks/process/useProcessResults";

type PQuestion = ProcessMetadata["questions"][0];
type PChoice = ProcessMetadata["questions"][0]["choices"][0];
type PResult = ProcessResults[0]["choices"][0];

function readablePercent(percent: string): string {
  if (!percent) return "";
  else if (percent === "N/A") return "Locked";
  else if (percent === "0") return "0.0%";
  else if (percent === "small") return "<0.1%";
  else return percent + "%";
}

const Option = ({
  choice,
  choiceResult,
  onChoiceSelect,
  questionIdx,
  checked,
  canSelect,
}: {
  choice: PChoice;
  choiceResult: PResult;
  onChoiceSelect: (qIdx: number, value: number) => void;
  questionIdx: number;
  checked: boolean;
  canSelect: boolean;
}) => (
  <OptionLabel>
    {canSelect ? (
      <Checkbox checked={checked} onChange={() => onChoiceSelect(questionIdx, choice.value)} />
    ) : (
      <ChoiceInfo>
        <Percentage>{readablePercent(choiceResult?.percentage)}</Percentage>
      </ChoiceInfo>
    )}
    <OptionTitleContainer>
      <OptionTitle>{choice.title.default}</OptionTitle>
      <OptionSubtitle>{choiceResult?.votes || ""}</OptionSubtitle>
    </OptionTitleContainer>
  </OptionLabel>
);

export const Questions = ({
  questions,
  results,
  onChoiceSelect,
  choicesSelected,
  canSelect,
}: {
  questions: PQuestion[];
  results: ProcessResults;
  onChoiceSelect: (qIdx: number, value: number) => void;
  choicesSelected: number[];
  canSelect: boolean;
}) => {
  if (!questions) return <div />;

  return (
    <div>
      {questions.map(({ title, description, choices }, qIdx) => (
        <QuestionContainer key={qIdx}>
          <QuestionInformation>
            <QuestionNumber>Question #{qIdx + 1}</QuestionNumber>
            <QuestionTitle>{title.default}</QuestionTitle>
            <QuestionDescription>{description.default}</QuestionDescription>
          </QuestionInformation>
          <QuestionOptions no_choices={choices.length}>
            {choices.map((choice, cIdx) => {
              const choiceResult = results && results[qIdx] && results[qIdx].choices[cIdx];
              return (
                <Option
                  key={cIdx}
                  questionIdx={qIdx}
                  choice={choice}
                  choiceResult={choiceResult}
                  onChoiceSelect={onChoiceSelect}
                  checked={choicesSelected && choicesSelected[qIdx] === choice.value}
                  canSelect={canSelect}
                />
              );
            })}
          </QuestionOptions>
        </QuestionContainer>
      ))}
    </div>
  );
};
