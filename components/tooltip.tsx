import React from "react";
import styled from "styled-components";
import { useTooltipNewLine } from "../lib/hooks/useWindowSize";

interface Props {
  newLine: boolean;
  topText: boolean;
}

const CircleContainer = styled.div`
  float: left;
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

  ${CircleContainer}:hover & {
    background: ${({ theme }) => theme.secondary.s6};
    box-shadow: ${({ theme }) => theme.shadows.cardShadow};
    transition: all 0.2s ease-out;
    transform: translateY(-1px);
  }
`;

const CircleEncrypted = styled.div`
  background: ${({ theme }) => theme.secondary.s3};
  border-radius: 50%;
  box-shadow: ${({ theme }) => theme.shadows.buttonShadow};
  color: white;
  float: left;
  width: 16px;
  height: 16px;
  margin-top: -20px;

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
  margin-left: 4.5px;
  margin-top: -2px;
  user-select: none; 
  -webkit-touch-callout : none
  -webkit-user-select:none
`;

const TooltipText = styled.div<Props>`
  background-color: #f3f4ff;
  border-radius: 10px;
  color: ${({ theme }) => theme.secondary.s3};
  float: left;
  font-size: 16px;
  margin-bottom: ${(props) => (props.newLine ? "8px" : "0px")};
  margin-left: ${(props) => (props.newLine ? "-160px" : "40px")};
  margin-top: ${(props) => (props.newLine ? (props.topText ? "19px" : "8px") : "0px")};
  text-align: left;
  visibility: hidden;
  width: ${(props) => (props.newLine ? "180px" : "160px")};
  position: absolute;
  z-index: 1;

  ${CircleContainer}:hover & {
    visibility: visible;
  }
`;

const Tooltip = () => {
  const tooltipNewLine = useTooltipNewLine();
  const realtimeText = "Results can be viewed in real time";
  const encryptedText = "Results are hidden until the vote concludes";

  return tooltipNewLine ? (
    <div>
      <CircleContainer>
        <Circle>
          <QuestionMark>?</QuestionMark>
        </Circle>
        <br />
        <br />
        <TooltipText newLine topText>
          {realtimeText}
        </TooltipText>
      </CircleContainer>

      <br />
      <br />

      <CircleContainer>
        <CircleEncrypted>
          <QuestionMark>?</QuestionMark>
        </CircleEncrypted>
        <br />
        <TooltipText newLine topText={false}>
          {encryptedText}
        </TooltipText>
      </CircleContainer>
    </div>
  ) : (
    <div>
      <CircleContainer>
        <Circle>
          <QuestionMark>?</QuestionMark>
        </Circle>
        <TooltipText newLine={false} topText={false}>
          {realtimeText}
        </TooltipText>
      </CircleContainer>

      <br />
      <br />

      <CircleContainer>
        <CircleEncrypted>
          <QuestionMark>?</QuestionMark>
        </CircleEncrypted>
        <TooltipText newLine={false} topText={false}>
          {encryptedText}
        </TooltipText>
      </CircleContainer>
    </div>
  );
};

export default Tooltip;
