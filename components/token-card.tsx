/* eslint-disable react/display-name */
import React from "react";
import styled from "styled-components";
import Link from "next/link";
import { FALLBACK_TOKEN_ICON } from "../lib/constants";
import { shortTokenName } from "../lib/utils";

const Container = styled.div`
  background: ${({ theme }) => theme.blackAndWhite.w1};
  cursor: pointer;
  flex: 1 0 500px;
  box-sizing: border-box;
  margin: 0.5rem 0.5em;
  border-radius: 13px;
  box-shadow: ${({ theme }) => theme.shadows.cardShadow};
  border: 1px solid ${({ theme }) => theme.grayScale.g2};

  &:hover {
    box-shadow: ${({ theme }) => theme.shadows.cardShadow};
    background: linear-gradient(
      ${({ theme }) => theme.gradients.cardGradient.a},
      ${({ theme }) => theme.gradients.cardGradient.c1}66 1.46%,
      ${({ theme }) => theme.gradients.cardGradient.c2}66 100%
    );
  }

  max-width: calc(33.3333333% - 1em);
  min-width: 395px;
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
  font-size: 28px;
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

const ActiveProposals = styled.p`
  color: ${({ theme }) => theme.primary.p1};
  padding-left: 90px;
  padding-top: 10px;
  font-weight: 400;
  align-items: center;
  letter-spacing: 0.01em;
`;

const Cap = styled.p`
  color: ${({ theme }) => theme.blackAndWhite.b1};
  position: absolute;
  width: 320px;
  font-weight: 400;
  font-size: 16px;
  align-items: center;
  text-align: right;
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
  activeProposals?: number;
}

type CardProps = {
  key?: string | number;
  symbol?: string;
  children: React.ReactNode;
  name: string;
  icon: string;
  rightText?: string;
  href: string;
  tokenCap?: string;
  onClick?: () => void;
};

{
  /* NOTE temporarily removed information on the cards, as they are not must haves right 
now. Should be implemented later, along with the fallback screens. VR 23-04-2021 */
}
// eslint-disable-next-line react/display-name
const ClickableTokenCard = React.forwardRef<HTMLDivElement, CardProps>(
  ({ onClick, icon, rightText, name, children, tokenCap }, ref) => {
    return (
      <Card onClick={onClick} ref={ref}>
        <TokenLogo src={icon} onError={loadFallback} />
        {rightText && <RightText>{rightText}</RightText>}
        <Cap>{tokenCap?.length ? `(${abbreviatedTokenAmount(tokenCap)})` : "(N/A)"}</Cap>
        <Symbol>{name}</Symbol>
        <Name>{children}</Name>
        {/* <ActiveProposals>7 active proposals</Proposals> */}
      </Card>
    );
  }
);

// This helper-method converts a string of tokens into a abbreviated version.
// ONLY ACCEPTS NON-EMTPY STRINGS
function abbreviatedTokenAmount(amount: string): string {
  const regexp = /(?<lead>\d+)(?<body>[,\d*]*)[.]*[\d]*\s(?<symbol>[A-Za-z]+)/;
  const regexp_res = amount.match(regexp);
  // discard failed matches
  if (!regexp_res?.length || regexp_res[0].length !== amount.length || regexp_res.length !== 4)
    return "N/A";

  const lead = regexp_res[1];
  const body = regexp_res[2];
  const symbol = regexp_res[3];

  if (regexp_res[2].length === 0) return lead + " " + symbol;
  const magnitude = regexp_res[2].length / 4;
  const magnitude_letter = ["K", "M", "B"];

  let abbreviation: string;
  if (magnitude <= 3) {
    abbreviation = magnitude_letter[magnitude - 1];
  } else {
    abbreviation = "*10^" + magnitude * 3;
  }

  return lead + abbreviation + " " + symbol;
}

const CardHeader = styled.div`
  display: flex;
  margin-bottom: 0px;
`;

const VoteTokenLogo = styled.img`
  padding-top: 2px;
  width: 71px;
  height: 71px;
`;

const TokenDescription = styled.div`
  display: inline;
  padding-left: 16px;
`;

const VoteSymbol = styled.h4`
  height: 30px;
  margin-top: 0px;
  margin-bottom: 0px;
  padding-top: 18px;
  color: ${({ theme }) => theme.blackAndWhite.b1};
  font-weight: 500;
  font-size: 29px;
  letter-spacing: 0.01em;
`;

const VoteName = styled.p`
  height: 20px;
  margin-top: 0px;
  margin-bottom: 0px;
  padding-top: 4px;
  color: ${({ theme }) => theme.grayScale.g5};
  letter-spacing: 0.01em;
  font-size: 18;
`;

const ProposalTitle = styled.p`
  margin-top: 8px;
  color: ${({ theme }) => theme.blackAndWhite.b1};
  font-size: 18px;
  font-weight: 400;
  line-height: 25px;
  letter-spacing: 0.02em;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
`;

const ClickableVoteCard = React.forwardRef<HTMLDivElement, CardProps>(
  ({ onClick, icon, name, symbol, children }, ref) => {
    return (
      <Card onClick={onClick} ref={ref}>
        <CardHeader>
          <div>
            <VoteTokenLogo src={icon} onError={loadFallback} />
          </div>
          <TokenDescription>
            <VoteSymbol>{symbol}</VoteSymbol>
            <VoteName>{name && shortTokenName(name)}</VoteName>
          </TokenDescription>
        </CardHeader>
        <ProposalTitle>{children}</ProposalTitle>
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
      <ClickableTokenCard {...props}>{children}</ClickableTokenCard>
    </Link>
  </Container>
);

export const VoteCard = ({ children, ...props }: CardProps) => (
  <Container>
    <Link href={props.href}>
      <ClickableVoteCard {...props}>{children}</ClickableVoteCard>
    </Link>
  </Container>
);

export default TokenCard;
