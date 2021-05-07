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

const Option = ({ choice, onChoiceSelect, questionId, checked, canVote }) => (
  <OptionLabel>
    {canVote ? (
      <Checkbox checked={checked} onChange={() => onChoiceSelect(questionId, choice.id)} />
    ) : (
      <ChoiceInfo>
        <Percentage>{choice.percentage === "N/A" ? "Locked" : `${choice.percentage}%`}</Percentage>
      </ChoiceInfo>
    )}
    <OptionTitleContainer>
      <OptionTitle>{choice.title}</OptionTitle>
      <OptionSubtitle>
        {choice.votes} {choice.token}
      </OptionSubtitle>
    </OptionTitleContainer>
  </OptionLabel>
);

export const Questions = ({ questions, onChoiceSelect, choicesSelected, canVote }) => {
  return (
    <div>
      {!questions
        ? null
        : questions.map(({ title, description, choices }, i) => (
            <QuestionContainer key={`question_${i}`}>
              <QuestionInformation>
                <QuestionNumber>Question #{i + 1}</QuestionNumber>
                <QuestionTitle>{title}</QuestionTitle>
                <QuestionDescription>{description}</QuestionDescription>
              </QuestionInformation>
              <QuestionOptions>
                {choices.map((choice, j) => {
                  return (
                    <Option
                      key={`choice_${j}`}
                      questionId={i}
                      choice={{ ...choice, id: j }}
                      onChoiceSelect={onChoiceSelect}
                      checked={choicesSelected && choicesSelected[i] === j}
                      canVote={canVote}
                    />
                  );
                })}
              </QuestionOptions>
            </QuestionContainer>
          ))}
    </div>
  );
};
