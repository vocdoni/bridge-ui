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

const Option = ({ title }) => {
  return (
    <OptionLabel>
      <Radio type="checkbox" />
      <OptionTitleContainer>
        <OptionTitle>{title}</OptionTitle>
      </OptionTitleContainer>
    </OptionLabel>
  );
};

export const Questions = (questions) => {
  return (
    <div>
      {questions.map(({ title, description, choices }, i) => {
        return (
          <QuestionContainer>
            <QuestionInformation>
              <QuestionNumber>Question #{i + 1}</QuestionNumber>
              <QuestionTitle>{title}</QuestionTitle>
              <QuestionDescription>{description}</QuestionDescription>
            </QuestionInformation>
            <QuestionOptions>
              {choices.map(({ title }) => {
                return <Option title={title} />;
              })}
            </QuestionOptions>
          </QuestionContainer>
        );
      })}
    </div>
  );
};
