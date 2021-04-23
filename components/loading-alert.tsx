import React from "react";
import styled from "styled-components";
import Spinner from "react-svg-spinner";
import { useLoadingAlert } from "../lib/hooks/loading-alert";

export const LoadingAlert = () => {
  const { message } = useLoadingAlert();

  return (
    <LoadingAlertContainer visible={message?.length > 0}>
      <div>{message || ""}</div>
      <div>
        <Spinner />
      </div>
    </LoadingAlertContainer>
  );
};

const LoadingAlertContainer = styled.div<{ visible: boolean }>`
  // TODO:
  // position: fixed;
  // z-index: 320;
  top: 10px;
  left: 10px;
  right: 10px;
  font-size: 90%;
  text-align: center;
  user-select: none;
  font-size: 16px;

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
    left: 15vw;
    right: 15vw;
  }

  @media ${({ theme }) => theme.screens.tablet} {
    justify-content: flex-end;
    text-align: right;
    top: 1, 0px;
    left: unset;
    max-width: 330px;
    right: 10px;
    transform: ${({ visible }) => `translate(${visible ? 0 : 360}px  0px)`};
  }

  & > div:first-child {
    margin-right: 15px;
  }
  & > div:last-child {
    padding-top: 4px;
  }
`;
