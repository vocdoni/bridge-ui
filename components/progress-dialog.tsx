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

export type ProgressComponentProps = {
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
}: ProgressComponentProps) {
  const theme = useTheme();
  const { title, subtitle, body } = getTexts(state, errorMessage);

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

  return (
    <ProgressContainer>
      <LadyImage src={MEDITATING_LADY_IMG} />
      <TextSection>
        <SectionTitle title={title} subtitle={subtitle} />
        <ProgressStatus>
          <ProgressIcon />
          <p>{body}</p>
        </ProgressStatus>
        <ButtonsRow state={state} setState={setState} tokenId={tokenId} proposalId={processId} />
      </TextSection>
    </ProgressContainer>
  );
}

export type ButtonsRowProps = {
  state: ProgressState;
  setState: (a: ProgressState) => void;
  tokenId: string;
  proposalId?: string;
};

function ButtonsRow({ state, setState, tokenId, proposalId }: ButtonsRowProps) {
  const router = useRouter();

  const toCreatedProcess = () => router.push("/processes#/" + proposalId);
  const toTokenPage = () => router.push("/tokens/info#/" + tokenId);
  const toNewProposal = () => router.reload();
  const hideComponent = () => setState(ProgressState.IDLE);

  switch (state) {
    case ProgressState.WAITING:
      return null;
    case ProgressState.DONE:
      return (
        <ButtonsContainer>
          <PrimaryButton onClick={toCreatedProcess}>Take me to the proposal</PrimaryButton>
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

// STYLES =============================================================================

/* This is the component's top container. It breaks into a column when smaller than tabletL */
const ProgressContainer = styled.div`
  display: flex;
  padding: 40px;
  background: ${({ theme }) => theme.blackAndWhite.w1};
  border-radius: 13px;

  @media ${({ theme }) => theme.screens.tabletL} {
    flex-direction: column;
    align-items: center;
  }
  @media ${({ theme }) => theme.screens.mobileL} {
    padding: 20px;
  }
`;

const LadyImage = styled.img`
  margin-top: 16px;
  margin-bottom: 8px;
  width: 355px;

  @media ${({ theme }) => theme.screens.tabletL} {
    width: 100%;
    width: 480px;
  }
  @media ${({ theme }) => theme.screens.tablet} {
    max-width: 400px;
  }
  @media ${({ theme }) => theme.screens.mobileL} {
    width: 94%;
  }
`;

/* This section holds everything except the image */
const TextSection = styled.div`
  padding-left: 40px;

  @media ${({ theme }) => theme.screens.tabletL} {
    padding-left: unset;
  }
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

const ButtonsContainer = styled.div`
  padding-top: 32px;

  & > :not(:first-child) {
    margin-left: 16px;
  }
  @media ${({ theme }) => theme.screens.laptop} {
    & > :not(:first-child) {
      margin-top: 16px;
      margin-left: unset;
    }
    display: flex;
    flex-direction: column;
  }
`;

// HELPERS =============================================================================

type TextInfo = {
  title: string;
  subtitle: string;
  body: string;
};

function getTexts(state: ProgressState, errorMessage: string): TextInfo {
  switch (state) {
    case ProgressState.WAITING:
      return {
        title: "Creating your proposal",
        subtitle: "Hold tight - your proposal is being created. It will be ready soon",
        body: "Your proposal is being created",
      };
    case ProgressState.DONE:
      return {
        title: "Your proposal is ready",
        subtitle: "You can now vote on it and share it with your community",
        body: "Your proposal is ready",
      };
    case ProgressState.FAILED:
      const errorBody = errorMessage
        ? "Your proposal could not be created, because:\n" + errorMessage
        : "Your proposal could not created";
      return {
        title: "Creation Unsuccessful",
        subtitle: "Unfortunately, your proposal could not be created",
        body: errorBody,
      };
    default:
      throw new NonExistingCaseError();
  }
}

export default ProgressComponent;
