import React from "react";
import styled from "styled-components";
import Link from "next/link";
import { FALLBACK_TOKEN_ICON } from "../lib/constants";

const Container = styled.div`

  background: ${({ theme }) => theme.blackAndWhite.w1};
  cursor: pointer;
  flex: 1 0 500px;
  box-sizing: border-box;
  margin: 0.5rem 0.5em;
  border-radius: 13px;
  box-shadow: 0px 6px 6px rgba(180, 193, 228, 0.35);
  border: 1px solid ${({ theme }) => theme.grayScale.g2};

  &:hover {
    box-shadow: 0px 6px 6px rgba(180, 193, 228, 0.35);
    background: linear-gradient(
      101.6deg,
      ${({ theme }) => theme.gradients.primary.mg1_soft.c1}33,
      ${({ theme }) => theme.gradients.primary.mg1_soft.c2}33,
      ${({ theme }) => theme.gradients.primary.mg1_soft.c3}33
    );
  }

  max-width: calc(33.3333333% - 2em);
  min-width: 414px;
  max-height: 164px;
  left: 176px;
  top: 633px;

  @media ${({ theme }) => theme.screens.tablet} {
    margin: 10px;
    max-width: calc(50% - 2em);
    text-align: start;
    justify-content: center;
  }
  @media ${({ theme }) => theme.screens.mobileL} {
    max-width: calc(100% - 2em);
  }
`;

const Card = styled.div`
  padding: 1.8em;
  padding-top: 35px;
  line-height: 0px;
`;

const TokenLogo = styled.img`
  position: absolute;
  padding-top: 2px;
  width: 71px;
  height: 71px;
`;

const Symbol = styled.h4`
  color: ${({ theme }) => theme.blackAndWhite.b1};
  padding-left: 90px;
  padding-top: 22px;
  position: absolute;
  font-weight: 500;
  font-size: 29px;
  margin-top: 0px;
  align-items: center;
  letter-spacing: 0.01em;
`;

const Name = styled.p`
  color: ${({ theme }) => theme.grayScale.g5};
  padding-left: 90px;
  padding-top: 18px;
  align-items: center;
  letter-spacing: 0.01em;
`;

const Proposals = styled.p`
  color: ${({ theme }) => theme.primary.p1};
  padding-left: 90px;
  padding-top: 10px;
  font-weight: 400;
  align-items: center;
  letter-spacing: 0.01em;
`;

const Cap = styled.p`
  color: ${({ theme }) => theme.blackAndWhite.b1};
  padding-left: 250px;
  position: absolute;
  font-weight: 400;
  font-size: 20px;
  align-items: center;
  letter-spacing: 0.01em;
`;

const RightText = styled.span`
  float: right;
`;

interface Token {
  address: string;
  symbol: string;
  icon: string;
  name: string;
  cap?: string;
  activeProposals?: number
}

type CardProps = {
  key?: string | number;
  children: React.ReactNode;
  name: string;
  icon: string;
  rightText?: string;
  href: string;
  onClick?: () => void;
};

// eslint-disable-next-line react/display-name
const ClickableCard = React.forwardRef<HTMLDivElement, CardProps>(
  ({ onClick, icon, rightText, name, children }, ref) => {
    return (
      <Card onClick={onClick} ref={ref}>
        <TokenLogo src={icon} onError={loadFallback} />
        {rightText && <RightText>{rightText}</RightText>}
        <Cap>($915M)</Cap>
        <Symbol>{name}</Symbol>
        <Name>{children}</Name>
        <Proposals>7 active proposals</Proposals>
      </Card>
    );
  }
);

function loadFallback(event) {
  event.target.src = FALLBACK_TOKEN_ICON;
}

const TokenCard = ({ children, ...props }: CardProps) => (
  <Container>
    <Link href={props.href}>
      <ClickableCard {...props}>{children}</ClickableCard>
    </Link>
  </Container>
);

export default TokenCard;

