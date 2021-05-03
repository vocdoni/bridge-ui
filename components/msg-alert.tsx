import React from "react";
import styled from "styled-components";
import { useMessageAlert } from "../lib/hooks/message-alert";
import { MsgType } from "../lib/types";

export const MessageAlert = () => {
  const { msgType, message, clearAlert, closeToast } = useMessageAlert();

  return (
    <AlertContainer visible={!closeToast} msgType={msgType} hasMsg={!!message?.length}>
      <AlertText msgType={msgType}>{message || ""}</AlertText>
      <CloseAlert visible={!closeToast} msgType={msgType} onClick={clearAlert}>
        <Cross />
      </CloseAlert>
    </AlertContainer>
  );
};

const Cross = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M7.66294 7.00003L12.8627 1.80023C13.0458 1.61716 13.0458 1.32035 12.8627 1.1373C12.6796 0.954256 12.3828 0.954232 12.1998 1.1373L6.99999 6.3371L1.80023 1.1373C1.61716 0.954232 1.32035 0.954232 1.1373 1.1373C0.954256 1.32037 0.954233 1.61719 1.1373 1.80023L6.33706 7L1.1373 12.1998C0.954233 12.3829 0.954233 12.6797 1.1373 12.8627C1.22883 12.9543 1.3488 13 1.46878 13C1.58875 13 1.70871 12.9543 1.80025 12.8627L6.99999 7.66296L12.1997 12.8627C12.2913 12.9543 12.4112 13 12.5312 13C12.6512 13 12.7712 12.9543 12.8627 12.8627C13.0458 12.6797 13.0458 12.3828 12.8627 12.1998L7.66294 7.00003Z" />
  </svg>
);

const CloseAlert = styled.div<{ msgType: MsgType; visible: boolean }>`
  opacity: ${({ visible }) => (visible ? "1" : "0")};
  stroke: ${({ theme, msgType }) =>
    msgType === "error"
      ? theme.functionality.f3
      : msgType === "success"
      ? theme.functionality.f4
      : msgType === "warning"
      ? theme.secondary.s5
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
      : msgType === "warning"
      ? theme.secondary.s5
      : theme.primary.p1};
  margin-right: 49px;
  font-size: 14px;
  font-weight: 500;
  text-align: left;
`;

const AlertContainer = styled.div<{ visible: boolean; msgType: MsgType; hasMsg: boolean }>`
  position: fixed;
  z-index: 320;
  bottom: 90px;
  right: 16px;
  user-select: none;

  box-sizing: border-box;
  box-shadow: ${({ theme }) => theme.shadows.cardShadow};
  padding: 18px;

  display: flex;
  justify-content: center;
  align-items: center;
  max-width: 320px;

  background-color: ${({ theme, msgType }) =>
    msgType === "error"
      ? theme.alerts.a1
      : msgType === "success"
      ? theme.alerts.a2
      : msgType === "warning"
      ? theme.alerts.a3
      : theme.alerts.a4};
  border-radius: 10px;

  transform: ${({ hasMsg }) => `translate(${hasMsg ? 0 : 320}px)`};
  opacity: ${({ visible }) => (visible ? "1" : "0")};

  transition: transform 0.5s ease-out, opacity 0.5s ease-out;

  @media ${({ theme }) => theme.screens.tablet} {
    text-align: center;
    bottom: unset !important;
    top: 90px;
    left: 0;
    right: 0;
    margin: 0 auto;
    max-width: 75vw;
  }
`;
