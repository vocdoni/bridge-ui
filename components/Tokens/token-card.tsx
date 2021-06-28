/* eslint-disable react/display-name */
import React, { useEffect, useState } from "react";
import styled from "styled-components";
import Link from "next/link";
import { FALLBACK_TOKEN_ICON } from "../../lib/constants";
import { shortTokenName } from "../../lib/utils";
import { abbreviatedTokenAmount } from "../../lib/utils";

const Container = styled.div`
  background: ${({ theme }) => theme.blackAndWhite.w1};
  cursor: pointer;
  flex: 1 0 500px;
  box-sizing: border-box;
  border-radius: 13px;
  box-shadow: ${({ theme }) => theme.shadows.cardShadow};
  border: 1px solid ${({ theme }) => theme.grayScale.g2};
  max-width: calc(33.3333333% - 0.3333333em);
  min-width: 347px;
  max-height: 164px;
  position: relative;
  z-index: 1;

  &:before {
    position: absolute;
    content: "";
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    border-radius: 13px;
    box-shadow: ${({ theme }) => theme.shadows.cardShadow};
    background: linear-gradient(
      ${({ theme }) => theme.gradients.cardGradient.a},
      ${({ theme }) => theme.gradients.cardGradient.c1},
      ${({ theme }) => theme.gradients.cardGradient.c2}66
    );
    transition: opacity 300ms ease-in-out;
    opacity: 0;
    z-index: -1;
  }

  &:hover:before {
    opacity: 1;
  }

  @media ${({ theme }) => theme.screens.laptopL} {
    max-width: calc(50% - 0.25em);
    min-width: 332px;
  }

  @media ${({ theme }) => theme.screens.tabletL} {
    max-width: 100%;
    width: 100%;
    z-index: 0;
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
  flex-direction: column;
`;

const Symbol = styled.div`
  display: block;
  font-family: "Manrope", sans-serif !important;
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
  font-family: "Manrope", sans-serif !important;
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

const TokenBodyHeader = styled.div`
  display: flex;
  justify-content: space-between;
`;

const TokenLogoImg = styled.img`
  padding-top: 2px;
  border-radius: 50%;
  width: 71px;
  height: 71px;
`;

export const TokenLogo: React.FC<React.ImgHTMLAttributes<HTMLImageElement>> = (props) => {
  const [src, setSrc] = useState<string>(() => props.src || FALLBACK_TOKEN_ICON);
  useEffect(() => {
    setSrc(props.src || FALLBACK_TOKEN_ICON);
  }, [props.src]);

  const onError = () => {
    setSrc(FALLBACK_TOKEN_ICON);
  };

  return <TokenLogoImg {...props} src={src} onError={onError} />;
};

// eslint-disable-next-line react/display-name
const ClickableTokenCard = React.forwardRef<HTMLDivElement, CardProps>(
  ({ onClick, icon, rightText, name, children, tokenCap }, ref) => {
    return (
      <Card onClick={onClick} ref={ref}>
        <TokenLogo src={icon} />

        {rightText && <RightText>{rightText}</RightText>}
        <CardBody>
          <TokenBodyHeader>
            <Symbol>{name}</Symbol>
            <Cap>{tokenCap?.length ? `${abbreviatedTokenAmount(tokenCap)}` : "N/A"}</Cap>
          </TokenBodyHeader>

          <Name>{children}</Name>

          {/* <ActiveProposalsText>7 active proposals</ActiveProposalsText> */}
        </CardBody>
      </Card>
    );
  }
);

const CardHeader = styled.div`
  display: flex;
  margin-bottom: 0px;
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
            <TokenLogo src={icon} />
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

export const TokenCard = ({ children, ...props }: CardProps) => (
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
