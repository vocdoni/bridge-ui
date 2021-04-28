import React from "react";
import styled, { css } from "styled-components";
import { MultiLanguage } from "dvote-js";
import { PLUS_ICON, MINUS_ICON } from "../lib/constants";

const PlusBoxContainer = styled.div<{ remove?: boolean; add?: boolean }>`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  padding: 12px 20px;
  margin-bottom: 16px;
  margin-right: 200px;
  width: 46px;
  height: 44px;
  left: calc(50% - 46px / 2 + 95px);
  top: calc(50% - 44px / 2 + 679px);

  background: ${({ theme }) => theme.blackAndWhite.w1};
  border: 2px solid ${({ theme }) => theme.grayScale.g2};
  box-sizing: border-box;

  box-shadow: ${({ theme }) => theme.shadows.buttonShadow};
  border-radius: 8px;

  ${({ add }) =>
    add &&
    css`
      cursor: pointer;
      color: ${({ theme }) => theme.blackAndWhite.b1};
      &:hover {
        box-shadow: ${({ theme }) => theme.shadows.cardShadow};
      }
    `}

  ${({ remove }) =>
    remove &&
    css`
      cursor: pointer;
      color: ${({ theme }) => theme.blackAndWhite.b1};
      &:hover {
        box-shadow: ${({ theme }) => theme.shadows.cardShadow};
      }
    `}
`;

interface PlusBoxProps {
  currentChoice: number;
  choices: Array<{
    title: MultiLanguage<string>;
    value: number;
  }>;
  currentQuestion: number;
}

export const PlusBox = ({
  currentChoice,
  choices,
  currentQuestion,
  onClick,
}: PlusBoxProps & { onClick: (params: PlusBoxProps) => void }) => {
  const lastChoice = choices.length - 1;
  const isDefault = choices[currentChoice].title.default;

  const modifier = {};
  if (currentChoice === lastChoice && isDefault) {
    modifier["add"] = true;
  } else if (!(choices.length === 2)) {
    modifier["remove"] = true;
  }

  return (
    <PlusBoxContainer
      {...modifier}
      onClick={() => onClick({ currentQuestion, choices, currentChoice })}
    >
      {currentChoice === lastChoice && isDefault ? "+" : "-"}
    </PlusBoxContainer>
  );
};
