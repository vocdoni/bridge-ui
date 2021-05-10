import React from "react";

import {
  QuestionContainer,
  QuestionDescription,
  QuestionInformation,
  QuestionNumber,
  QuestionOptions,
  QuestionTitle,
  OptionSubtitle,
  OptionLabel,
  OptionTitleContainer,
  OptionTitle,
  ChoiceInfo,
  Percentage,
} from "./styled";

import Checkbox from "./checkbox";
import { ProcessMetadata } from "dvote-js";
import { ProcessResults } from "../../lib/hooks/process/useProcessResults";

type PQuestion = ProcessMetadata["questions"][0]
type PChoice = ProcessMetadata["questions"][0]["choices"][0]
type PResult = ProcessResults[0]["choices"][0]

const Option = ({ choice, choiceResult, onChoiceSelect, questionIdx, checked, canSelect }:
  { choice: PChoice, choiceResult: PResult, onChoiceSelect: (qIdx: number, value: number) => void, questionIdx: number, checked: boolean, canSelect: boolean }) => (
  <OptionLabel>
    {canSelect ? (
      <Checkbox checked={checked} onChange={() => onChoiceSelect(questionIdx, choice.value)} />
    ) : (
      <ChoiceInfo>
        <Percentage>{choiceResult?.percentage === "N/A" ? "Locked" : `${choiceResult?.percentage && choiceResult?.percentage || "0.0"}%`}</Percentage>
      </ChoiceInfo>
    )}
    <OptionTitleContainer>
      <OptionTitle>{choice.title.default}</OptionTitle>
      <OptionSubtitle>
        {choiceResult?.votes || ""}
      </OptionSubtitle>
    </OptionTitleContainer>
  </OptionLabel>
);

export const Questions = ({ questions, results, onChoiceSelect, choicesSelected, canSelect }:
  { questions: PQuestion[], results: ProcessResults, onChoiceSelect: (qIdx: number, value: number) => void, choicesSelected: number[], canSelect: boolean }) => {
  if (!questions) return <div />

  return (
    <div>
      {questions.map(({ title, description, choices }, qIdx) => (
        <QuestionContainer key={qIdx}>
          <QuestionInformation>
            <QuestionNumber>Question #{qIdx + 1}</QuestionNumber>
            <QuestionTitle>{title.default}</QuestionTitle>
            <QuestionDescription>{description.default}</QuestionDescription>
          </QuestionInformation>
          <QuestionOptions>
            {choices.map((choice, cIdx) => {
              const choiceResult = results && results[qIdx] && results[qIdx].choices[cIdx]
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
