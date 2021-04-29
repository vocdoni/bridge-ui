import React from "react";

import {
  QuestionContainer,
  QuestionDescription,
  QuestionInformation,
  QuestionNumber,
  QuestionOptions,
  QuestionTitle,
  OptionLabel,
  Radio,
  OptionTitleContainer,
  OptionTitle,
} from "./styled";

const Option = ({ title, choiceId, onChoiceSelect, questionId }) => {
  return (
    <OptionLabel>
      <Radio type="checkbox" onClick={() => onChoiceSelect(questionId, choiceId)} />
      <OptionTitleContainer>
        <OptionTitle>{title}</OptionTitle>
      </OptionTitleContainer>
    </OptionLabel>
  );
};

export const Questions = ({ questions, onChoiceSelect }) => {
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
                {choices.map((choice, j) => (
                  <Option
                    key={`choice_${j}`}
                    questionId={i}
                    title={choice.title}
                    choiceId={j}
                    onChoiceSelect={onChoiceSelect}
                  />
                ))}
              </QuestionOptions>
            </QuestionContainer>
          ))}
    </div>
  );
};
