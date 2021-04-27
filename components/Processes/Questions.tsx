import React from "react";
import {
  QuestionContainer,
  QuestionDescription,
  QuestionInformation,
  QuestionNumber,
  QuestionOptions,
  QuestionTitle,
} from "./styled";

export const Questions = () => {
  return (
    <QuestionContainer>
      <QuestionInformation>
        <QuestionNumber>Question #1</QuestionNumber>
        <QuestionTitle>Do you approve a minting of 900.000 new MKR Tokens?</QuestionTitle>
        <QuestionDescription>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt
          ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation
          ullamco laboris nisi ut aliquip ex ea commodo consequat.
        </QuestionDescription>
      </QuestionInformation>
      <QuestionOptions></QuestionOptions>
    </QuestionContainer>
  );
};
