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
    transition: 300ms;
  }

  max-width: calc(33.3333333% - 1em);
  min-width: 366px;
  min-height: 164px;
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
    min-width: unset;
  }
`;

const Card = styled.div`
  display: flex;
  flex-wrap: no-wrap;
  padding: 24px 18px;
  min-height: 164px;
  box-sizing: border-box;
`;

const StyledVoteCard = styled(Card)`
  @media ${({ theme }) => theme.screens.tablet} {
    flex-direction: column;
  }
`;

const TokenLogo = styled.img`
  width: 100%;
  height: 100%;
`;

const Symbol = styled.div`
  display: block;
  width: 100%;
  font-family: Manrope;
  font-style: normal;
  font-weight: 500;
  font-size: 29px;
  line-height: 40px;
  display: flex;
  align-items: center;
  letter-spacing: 0.01em;
  margin: 0px;
  color: ${({ theme }) => theme.blackAndWhite.b1};
`;

const Name = styled.div`
  color: ${({ theme }) => theme.grayScale.g5};
  align-items: center;
  letter-spacing: 0.02em;
  margin: 0;
  font-family: Manrope;
  font-style: normal;
  font-weight: 300;
  font-size: 18px;
  color: #7b8ab0;

  & > p {
    margin: 0;
    font-size: 18px;
  }
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

const CardBody = styled.div`
  box-sizing: border-box;
  padding-left: 20px;
  flex: 1;
`;

const TokenLogoContainer = styled.div`
  padding-top: 2px;
  width: 71px;
  height: 71px;
`;

const TokenBodyHeader = styled.div`
  display: flex;
  justify-content: space-between;
`;

const ActiveProposalsText = styled.p`
  margin: 0;
  display: block;
  padding-top: 8px;
  font-family: Overpass;
  font-style: normal;
  font-weight: 300;
  font-size: 18px;
  letter-spacing: 0.02em;
  color: #00c2ff;
`;

{
  /* NOTE temporarily removed information on the cards, as they are not must haves right 
now. Should be implemented later, along with the fallback screens. VR 23-04-2021 */
}
// eslint-disable-next-line react/display-name
const ClickableTokenCard = React.forwardRef<HTMLDivElement, CardProps>(
  ({ onClick, icon, rightText, name, children, tokenCap }, ref) => {
    return (
      <Card onClick={onClick} ref={ref}>
        <TokenLogoContainer>
          <TokenLogo src={icon} onError={loadFallback} />
        </TokenLogoContainer>

        {rightText && <RightText>{rightText}</RightText>}
        {/* <Cap>($915M)</Cap> */}
        <CardBody>
          <TokenBodyHeader>
            <Symbol>{name}</Symbol>
            <Cap>{tokenCap?.length ? `${abbreviatedTokenAmount(tokenCap)}` : "N/A"}</Cap>
          </TokenBodyHeader>

          <Name>{children}</Name>

          <ActiveProposalsText>7 active proposals</ActiveProposalsText>
        </CardBody>
        {/* <Proposals>7 active proposals</Proposals> */}
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
  font-size: 18px;
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

  @media ${({ theme }) => theme.screens.tablet} {
    padding-top: 0;
  }
`;

const VoteName = styled.p`
  min-height: 20px;
  margin-top: 0px;
  margin-bottom: 0px;
  padding-top: 4px;
  color: ${({ theme }) => theme.grayScale.g5};
  letter-spacing: 0.01em;
  font-size: 18px;
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
      <StyledVoteCard onClick={onClick} ref={ref}>
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
      </StyledVoteCard>
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
