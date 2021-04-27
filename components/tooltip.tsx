import React from "react";
import styled, { keyframes } from "styled-components";
import { useTooltipNewLine } from "../lib/hooks/useWindowSize";

const CircleContainer = styled.div`
  float: left;
  height: 24px;
  margin: 6px 0px 0px 21px;
  width: 24px;
`;

const Circle = styled.div`
  background: #635BFF;
  border-radius: 50%;
  box-shadow: 0 4px 6px 0 rgba(0, 0, 0, 0.1), 0 6px 20px 0 rgba(0, 0, 0, 0.01);
  color: white;
  cursor: pointer;
  float: left;
  width: 100%;

  ${CircleContainer}:hover & {
    background: #8991FF;
    box-shadow: 0 4px 6px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.1);
    transition: all 0.2s ease-out;
    transform: translateY(-1px);
  }
`;

const QuestionMark = styled.div`
  font-size: 18px;
  margin-left: 7px;
  user-select: none; 
  -webkit-touch-callout : none
  -webkit-user-select:none
`;

const TooltipText = styled.div`
  background-color: #F3F4FF;
  border-radius: 10px;
  color: #865BFF;
  float: left;
  font-size: 14px;
  margin-bottom: ${props => props.newLine ? '8px' : '0px'};
  margin-left: ${props => props.newLine ? '-160px' : '40px'};
  margin-top: ${props => props.newLine ? (props.topText ? '19px' : '8px') : '0px'};
  text-align: left;
  visibility: hidden;
  width: 160px;
  padding: 14px 16px;
  position: absolute;
  z-index: 1;
  
  ${CircleContainer}:hover & {
    visibility: visible;
  }
`;

const Tooltip = () => {
  const tooltipNewLine = useTooltipNewLine();
  const realtimeText = "Results can be viewed in real time"
  const encryptedText = "Results are hidden until the vote concludes"

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

      <CircleContainer style={{marginTop: '-10px'}}>
        <Circle>
          <QuestionMark>?</QuestionMark>
        </Circle>
        <br />
        <TooltipText newLine>
          {encryptedText}
        </TooltipText >
      </CircleContainer>
    </div>
  ) : (
    <div>
      <CircleContainer>
        <Circle>
          <QuestionMark>?</QuestionMark>
        </Circle>
        <TooltipText>
          {realtimeText}
        </TooltipText>
      </CircleContainer>
      
      <br />
      <br />

      <CircleContainer style={{marginTop: '-10px'}}>
        <Circle>
          <QuestionMark>?</QuestionMark>
        </Circle>
        <TooltipText>
          {encryptedText}
        </TooltipText>
      </CircleContainer>
    </div>
  )
}

export default Tooltip