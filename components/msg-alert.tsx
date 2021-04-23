import React from "react";
import styled from "styled-components";
import { useMessageAlert } from "../lib/hooks/message-alert";

export const MessageAlert = () => {
  const { message } = useMessageAlert();

  return (
    <AlertContainer visible={!!message?.length}>
      <div>{message || ""}</div>
    </AlertContainer>
  );
};

const AlertContainer = styled.div<{ visible: boolean }>`
  position: fixed;
  z-index: 320;
  top: 10px;
  left: 10px;
  right: 10px;
  font-size: 90%;
  text-align: center;
  user-select: none;
  font-size: 16px;

  box-sizing: border-box;
  padding: ${({ visible }) => (visible ? "16px" : "0")};

  display: flex;
  justify-content: center;
  align-items: center;

  background-color: ${({ theme }) => theme.blackAndWhite.w1};
  border: 1px solid ${({ theme }) => theme.blackAndWhite.b1};
  border-radius: 4px;

  transform: ${({ visible }) => `translate(0px, ${visible ? 0 : 90} px)`};
  opacity: ${({ visible }) => (visible ? "1" : "0")};

  transition: transform 0.1s ease-out, opacity 0.1s ease-out;

  @media ${({ theme }) => theme.screens.tablet} {
    text-align: center;
    left: 0;
    right: 0;
    margin: 0 auto;
    max-width: 75vw;
    transform: ${({ visible }) => `translate(${visible ? 0 : 360}px  0px)`};
  }
`;
