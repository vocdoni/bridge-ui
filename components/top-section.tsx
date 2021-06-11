import React from "react";
import styled from "styled-components";
import { useIsMobile } from "../lib/hooks/useWindowSize";
import { ConnectButton } from "./ControlElements/connect-button";

const Head = styled.div`
  display: flex;
  flex-wrap: wrap;
  @media ${({ theme }) => theme.screens.tablet} {
    text-align: center;
  }
`;

const LeftSection = styled.div`
  width: 70%;
  @media ${({ theme }) => theme.screens.tablet} {
    width: 100%;
  }
`;

const RightSection = styled.div`
  width: 30%;
  margin-top: 3em;

  @media ${({ theme }) => theme.screens.tablet} {
    margin-top: 0;
    width: 100%;
    margin-left: 0;
  }
`;

const Title = styled.h1`
  margin-bottom: 5px;
`;

const Subtitle = styled.h4`
  margin-top: 5px;
  font-size: 20px;
  color: ${({ theme }) => theme.blackAndWhite.b1};
`;

interface TopSectionProps {
  title: string;
  description: string;
  Action?: () => JSX.Element;
}

export const TopSection = ({ title, description, Action }: TopSectionProps) => {
  const isMobile = useIsMobile();
  return (
    <Head>
      <LeftSection>
        <Title>{title}</Title>
        <Subtitle>{description}</Subtitle>
      </LeftSection>
      <RightSection>
        {isMobile ? null : <ConnectButton />}
        {Action ? <Action /> : null}
      </RightSection>
    </Head>
  );
};
