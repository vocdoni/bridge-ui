import React from "react";
import styled from "styled-components";

interface Props {
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

const CircleEncrypted = styled(Circle)`
  margin-top: -20px;
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

const TooltipText = styled.div<Props>`
  background-color: ${({ theme }) => theme.functionality.f6};
  border-radius: 10px;
  color: ${({ theme }) => theme.secondary.s3};
  float: left;
  font-size: 16px;
  margin-bottom: 0px;
  margin-left: 40px;
  margin-top: ${(props) => (props.topText ? "0px" : "-20px")};
  padding: 14px 16px;
  text-align: left;
  visibility: hidden;
  max-width: 293px;
  position: absolute;
  z-index: 1;
  ${CircleContainer}:hover & {
    visibility: visible;
  }
`;

export enum TooltipType {
  PROCESS,
  RESULTS,
}

const Tooltip = ({ type }: { type: TooltipType }) => {
  const REALTIME_DESCRIPTION =
    "Results for the proposal are available during the voting process, meaning anyone can see where the voting is leaning to.";
  const ENCRYPTED_DESCRIPTION =
    "Results for the proposal will be available only after voting is finished, meaning no one can see where the voting is leaning to before it is closed.";
  const SINGALING_DESCRIPTION = "Gasless proposal creation using Vochain layer 2 solution";
  const BINDING_DESCRIPTION =
    "Metadata is stored on Ethereum, increasing decentralization and verifiability";

  let firstText = "";
  let secondText = "";
  if (type === TooltipType.PROCESS) {
    firstText = SINGALING_DESCRIPTION;
    secondText = BINDING_DESCRIPTION;
  } else {
    firstText = REALTIME_DESCRIPTION;
    secondText = ENCRYPTED_DESCRIPTION;
  }

  return (
    <div>
      <CircleContainer>
        <Circle>
          <QuestionMark>?</QuestionMark>
        </Circle>
        <TooltipText topText>{firstText}</TooltipText>
      </CircleContainer>

      <br />
      <br />

      <CircleContainer>
        <CircleEncrypted>
          <QuestionMark>?</QuestionMark>
        </CircleEncrypted>
        <TooltipText topText={false}>{secondText}</TooltipText>
      </CircleContainer>
    </div>
  );
};

export default Tooltip;
