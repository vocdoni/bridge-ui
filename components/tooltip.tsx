import React from "react";
import styled from "styled-components";

const CircleContainer = styled.div`
  height: 24px;
  margin: 10px 0px 0px 21px;
  width: 24px;
`;

const Circle = styled.div`
  background: ${({ theme }) => theme.secondary.s3};
  border-radius: 50%;
  box-shadow: ${({ theme }) => theme.shadows.buttonShadow};
  color: white;
  float: left;
  width: 16px;
  height: 16px;

  // slightly elevates the questionmark on hover.
  ${CircleContainer}:hover & {
    background: ${({ theme }) => theme.secondary.s6};
    box-shadow: ${({ theme }) => theme.shadows.cardShadow};
    transition: all 0.2s ease-out;
    transform: translateY(-1px);
  }
`;

const QuestionMark = styled.div`
  font-size: 14px;
  font-weight: 500;
  margin-left: 4.25px;
  margin-top: -2px;
  user-select: none; 
  -webkit-touch-callout : none
  -webkit-user-select:none
`;

const TooltipBalloon = styled.div`
  position: absolute;
  max-width: 280px;
  margin-bottom: 0px;
  margin-left: 40px;
  padding: 14px 16px;
  background-color: ${({ theme }) => theme.functionality.f6};
  border-radius: 10px;
  color: ${({ theme }) => theme.secondary.s3};
  font-size: 16px;
  text-align: left;
  visibility: hidden;
  z-index: 1;
  ${CircleContainer}:hover & {
    visibility: visible;
  }

  @media${({ theme }) => theme.screens.mobileL} {
    float: unset;
    display: block;
    left: 50px;
    width: 200px;
    margin-top: 24px;
    margin-left: unset;
  }
`;

export const Tooltip = ({ hoverText }: { hoverText: string }) => {
  return (
    <CircleContainer>
      <Circle>
        <QuestionMark>?</QuestionMark>
      </Circle>
      <TooltipBalloon>{hoverText}</TooltipBalloon>
    </CircleContainer>
  );
};

export default Tooltip;
