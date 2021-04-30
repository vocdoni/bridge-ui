import React from "react";
import styled from "styled-components";
import { useMessageAlert } from "../lib/hooks/message-alert";
import { MsgType } from "../lib/types";

const Cross = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M7.66294 7.00003L12.8627 1.80023C13.0458 1.61716 13.0458 1.32035 12.8627 1.1373C12.6796 0.954256 12.3828 0.954232 12.1998 1.1373L6.99999 6.3371L1.80023 1.1373C1.61716 0.954232 1.32035 0.954232 1.1373 1.1373C0.954256 1.32037 0.954233 1.61719 1.1373 1.80023L6.33706 7L1.1373 12.1998C0.954233 12.3829 0.954233 12.6797 1.1373 12.8627C1.22883 12.9543 1.3488 13 1.46878 13C1.58875 13 1.70871 12.9543 1.80025 12.8627L6.99999 7.66296L12.1997 12.8627C12.2913 12.9543 12.4112 13 12.5312 13C12.6512 13 12.7712 12.9543 12.8627 12.8627C13.0458 12.6797 13.0458 12.3828 12.8627 12.1998L7.66294 7.00003Z" />
  </svg>
);

export const MessageAlert = () => {
  const { msgType, message, clearAlert } = useMessageAlert();

  return (
    <AlertContainer visible={!!message?.length} msgType={msgType}>
      <AlertText msgType={msgType}>{message || ""}</AlertText>
      <CloseAlert msgType={msgType} onClick={clearAlert}>
        <Cross />
      </CloseAlert>
    </AlertContainer>
  );
};

const CloseAlert = styled.div<{ msgType: MsgType }>`
  stroke: ${({ theme, msgType }) =>
    msgType === "error"
      ? theme.functionality.f3
      : msgType === "success"
      ? theme.functionality.f4
      : theme.primary.p1};
  pointer: cursor;
  position: absolute;
  top: 16px;
  right: 16px;
`;

const AlertText = styled.div<{ msgType: MsgType }>`
  color: ${({ theme, msgType }) =>
    msgType === "error"
      ? theme.functionality.f3
      : msgType === "success"
      ? theme.functionality.f4
      : theme.primary.p1};
  margin-right: 49px;
  font-size: 16px;
  text-align: left;
`;

const AlertContainer = styled.div<{ visible: boolean; msgType: MsgType }>`
  position: fixed;
  z-index: 320;
  bottom: 90px;
  right: 16px;
  font-size: 90%;
  user-select: none;
  font-size: 16px;

  box-sizing: border-box;
  box-shadow: ${({ theme }) => theme.shadows.cardShadow};
  padding: ${({ visible }) => (visible ? "16px" : "0")};

  display: flex;
  justify-content: center;
  align-items: center;
  max-width: 320px;

  background-color: ${({ msgType }) =>
    msgType === "error" ? "#F8E8EB" : msgType === "success" ? "#DEF4E8" : "#D7EEFB"};
  border-radius: 10px;

  transform: ${({ visible }) => `translate(0px, ${visible ? 0 : 90} px)`};
  opacity: ${({ visible }) => (visible ? "1" : "0")};

  transition: transform 0.1s ease-out, opacity 0.1s ease-out;

  @media ${({ theme }) => theme.screens.tablet} {
    text-align: center;
    bottom: unset !important;
    top: 90px;
    left: 0;
    right: 0;
    margin: 0 auto;
    max-width: 75vw;
    transform: ${({ visible }) => `translate(${visible ? 0 : 360}px  0px)`};
  }
`;
