import { useRouter } from "next/router";
import React from "react";
import styled, { useTheme } from "styled-components";

import { BLUE_TICK_ICON, MEDITATING_LADY_IMG, RED_CROSS_ICON } from "../lib/constants";
import { NonExistingCaseError } from "../lib/errors";
import { PrimaryButton, SecondaryButton } from "./ControlElements/button";

import SectionTitle from "./sectionTitle";
import { Spinner } from "./spinner";

export enum ProgressState {
  IDLE,
  WAITING,
  DONE,
  FAILED,
}

export type ProgressIndicatorProps = {
  state: ProgressState;
  setState: (a: ProgressState) => void;
  errorMessage?: string;
  tokenId: string;
  proposalId?: string;
};

function ProgressComponent({
  state,
  setState,
  errorMessage,
  tokenId,
  proposalId: processId,
}: ProgressIndicatorProps) {
  const theme = useTheme();
  const router = useRouter();

  function getAnnotationText() {
    switch (state) {
      case ProgressState.WAITING:
        return "Your proposal is being created";
      case ProgressState.DONE:
        return "Your proposal is ready";
      case ProgressState.FAILED:
        if (errorMessage) return "Your proposal could not created, because:\n" + errorMessage;
        return "Your proposal could not created";
      default:
        throw new NonExistingCaseError();
    }
  }

  function getTitle() {
    switch (state) {
      case ProgressState.WAITING:
        return "Creating your Proposal";
      case ProgressState.DONE:
        return "Your proposal is ready";
      case ProgressState.FAILED:
        return "Creation Unsuccessful";
      default:
        throw new NonExistingCaseError();
    }
  }

  function getSubtitle() {
    switch (state) {
      case ProgressState.WAITING:
        return "Hold tight - your proposal is being created. It will be ready soon";
      case ProgressState.DONE:
        return "You can now vote on it and share it with your community";
      case ProgressState.FAILED:
        return "Unfortunately, your proposal could not be created";
      default:
        throw new NonExistingCaseError();
    }
  }

  function ProgressIcon() {
    switch (state) {
      case ProgressState.WAITING:
        return <Spinner color={theme.primary.p1} size={20} thickness={4} />;
      case ProgressState.DONE:
        return <img src={BLUE_TICK_ICON} />;
      case ProgressState.FAILED:
        return <img width={20} height={20} src={RED_CROSS_ICON} />;
      default:
        throw new NonExistingCaseError();
    }
  }

  function Buttons() {
    const toCreatedProcess = () => router.push("/processes#/" + processId);
    const toTokenPage = () => router.push("/tokens/info#/" + tokenId);
    const toNewProposal = () => router.reload();

    const hideComponent = () => setState(ProgressState.IDLE);
    switch (state) {
      case ProgressState.WAITING:
        return <></>;
      case ProgressState.DONE:
        return (
          <ButtonsContainer>
            <PrimaryButton onClick={toCreatedProcess}>Take me to the Proposal</PrimaryButton>
            <SecondaryButton onClick={toNewProposal}>Create another proposal</SecondaryButton>
          </ButtonsContainer>
        );
      case ProgressState.FAILED:
        return (
          <ButtonsContainer>
            <PrimaryButton onClick={toTokenPage}>To the token page</PrimaryButton>
            <SecondaryButton onClick={hideComponent}>Back to the creation page</SecondaryButton>
          </ButtonsContainer>
        );
      default:
        throw new NonExistingCaseError();
    }
  }

  return (
    <ProgressContainer>
      <LadyImage src={MEDITATING_LADY_IMG} />
      <TextSection>
        <SectionTitle title={getTitle()} subtitle={getSubtitle()} />
        <ProgressStatus>
          <ProgressIcon />
          <p>{getAnnotationText()}</p>
        </ProgressStatus>
        <Buttons />
      </TextSection>
    </ProgressContainer>
  );
}

const ButtonsContainer = styled.div`
  & > :not(:first-child) {
    margin-left: 24px;
  }
  padding-top: 32px;
`;

const ProgressStatus = styled.div`
  display: flex;
  flex-direction: row;
  line-height: 25px;
  padding-top: 16px;

  p {
    margin: 0 10px;
    font-size: 18px;
    line-height: 20px;
    font-weight: 500;
    color: ${({ theme }) => theme.primary.p1};
  }
`;

const ProgressContainer = styled.div`
  display: flex;
  padding: 40px;
  background: ${({ theme }) => theme.blackAndWhite.w1};

  @media ${({ theme }) => theme.screens.mobileL} {
    flex-direction: column;
    align-itmes: center;
  }
`;

const TextSection = styled.div`
  padding-left: 40px;

  @media ${({ theme }) => theme.screens.mobileL} {
    flex-direction: column;
    align-itmes: center;
  }
`;

const LadyImage = styled.img`
  margin-top: 16px;
  margin-bottom: 8px;
  width: 355px;

  @media ${({ theme }) => theme.screens.mobileL} {
    width: 200px;
  }
`;

export default ProgressComponent;
