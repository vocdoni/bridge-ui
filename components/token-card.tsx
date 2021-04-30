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
  box-shadow: ${({ theme }) => theme.shadows.cardShadow};
  border: 1px solid ${({ theme }) => theme.grayScale.g2};

  &:hover {
    box-shadow: ${({ theme }) => theme.shadows.cardShadow};
    background: linear-gradient(
      101.6deg,
      ${({ theme }) => theme.gradients.primary.mg1_soft.c1}33,
      ${({ theme }) => theme.gradients.primary.mg1_soft.c2}33,
      ${({ theme }) => theme.gradients.primary.mg1_soft.c3}33
    );
  }

  max-width: calc(33.3333333% - 1em);
  min-width: 366px;
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
  display: flex;
  flex-flow: row no-wrap;
  padding: 39px;
  min-height: 164px;
  box-sizing: border-box;
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
  }
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
  activeProposals?: number;
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

const Price = styled.div``;

{
  /* NOTE temporarily removed information on the cards, as they are not must haves right 
now. Should be implemented later, along with the fallback screens. VR 23-04-2021 */
}
// eslint-disable-next-line react/display-name
const ClickableCard = React.forwardRef<HTMLDivElement, CardProps>(
  ({ onClick, icon, rightText, name, children }, ref) => {
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
            {/**
             * TODO: GET PRICE
             */}
            <Price>$987M</Price>
          </TokenBodyHeader>

          <Name>{children}</Name>
          {/**
           * TODO: GET ACTIVE PROPOSALS
           */}

          <ActiveProposalsText>7 active proposals</ActiveProposalsText>
        </CardBody>
        {/* <Proposals>7 active proposals</Proposals> */}
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
