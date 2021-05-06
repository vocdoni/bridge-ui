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
  margin-left: -5px;
  width: 46px;
  height: 44px;
  left: calc(50% - 46px / 2 + 95px);
  top: calc(50% - 44px / 2 + 679px);

  background-image: url(${MINUS_ICON});
  background-size: 20px 20px;
  background-repeat: no-repeat;
  background-position: center;
  background-color: ${({ theme }) => theme.blackAndWhite.w1};
  border: 2px solid ${({ theme }) => theme.grayScale.g2};
  box-sizing: border-box;

  box-shadow: ${({ theme }) => theme.shadows.buttonShadow};
  border-radius: 8px;

  @media ${({ theme }) => theme.screens.tablet} {
    margin-right: 0;
  }

  ${({ add }) =>
    add &&
    css`
      background-image: url(${PLUS_ICON});
      background-size: 20px 20px;
      background-repeat: no-repeat;
      background-position: center;
      background-color: ${({ theme }) => theme.blackAndWhite.w1};
      &:hover {
      cursor: pointer;
      color: ${({ theme }) => theme.blackAndWhite.b1};
      &:hover {
        box-shadow: ${({ theme }) => theme.shadows.cardShadow};
      }
    `}

  ${({ remove }) =>
    remove &&
    css`
      background-image: url(${MINUS_ICON});
      background-size: 20px 20px;
      background-repeat: no-repeat;
      background-position: center;
      cursor: pointer;
      color: ${({ theme }) => theme.blackAndWhite.b1};
      &:hover {
        box-shadow: ${({ theme }) => theme.shadows.cardShadow};
      }
    `}
`;

export const MinusContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  padding: 12px 20px;
  margin-top: -129px;
  margin-bottom: 30px;
  margin-right: 200px;
  width: 46px;
  height: 44px;
  left: calc(50% - 46px / 2 + 95px);
  top: calc(50% - 44px / 2 + 679px);

  background-image: url(${MINUS_ICON});
  background-size: 20px 20px;
  background-repeat: no-repeat;
  background-position: center;
  background-color: ${({ theme }) => theme.blackAndWhite.w1};
  border: 2px solid ${({ theme }) => theme.grayScale.g2};
  box-sizing: border-box;

  box-shadow: ${({ theme }) => theme.shadows.buttonShadow};
  border-radius: 8px;
  cursor: pointer;

  &:hover {
    cursor: pointer;
    box-shadow: ${({ theme }) => theme.shadows.cardShadow};
  }

  @media ${({ theme }) => theme.screens.tablet} {
    margin-top: -70px;
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
    />
  );
};
