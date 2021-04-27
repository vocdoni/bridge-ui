import React from "react";
import { MOCK_QUESTIONS } from "./state";
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

export const Questions = () => {
  return (
    <div>
      {MOCK_QUESTIONS.map(({ title, description, results }, i) => {
        return (
          <QuestionContainer>
            <QuestionInformation>
              <QuestionNumber>Question #{i + 1}</QuestionNumber>
              <QuestionTitle>{title}</QuestionTitle>
              <QuestionDescription>{description}</QuestionDescription>
            </QuestionInformation>
            <QuestionOptions>
              {results.map(({ title }) => {
                return <Option title={title} />;
              })}
            </QuestionOptions>
          </QuestionContainer>
        );
      })}
    </div>
  );
};
