import React from "react";
import { withRouter } from "next/router";
import styled from "styled-components";

import { featuredTokens } from "../lib/tokens";
import { useStoredTokens, useTokensWithBalance } from "../lib/hooks/tokens";
import { LANDING_PAGE_CTA, LIGHTNING_BOLT } from "../lib/constants";
import { TokenList } from "./dashboard";

import { TokenCard } from "../components/token-card";
import { SecondaryButton } from "../components/button";
import SectionTitle from "../components/sectionTitle";
import { shortTokenName } from "../lib/utils";
import { TokenInfo } from "../lib/types";
import { Else, If, Then, Unless, When } from "react-if";

import Link from "next/link";
import { useWallet } from "use-wallet";
import { useScrollTop } from "../lib/hooks/useScrollTop";
import { GrayRectangle } from "../components/gray-rectangle";
import { LoadingRectangle } from "../components/loading-rectangle";
import { NotConnected } from "../components/Banners/notConnected";

// MAIN COMPONENT

const IndexPage = () => {
  useScrollTop();
  const { storedTokens, loading: tokenListLoading, error: tokenListError } = useStoredTokens();
  const featuredTokenList: string[] = featuredTokens[process.env.ETH_NETWORK_ID] || [];
  const featuredTokenInfos = featuredTokenList
    .map((addr) => storedTokens.find((t) => t?.address == addr))
    .filter((tok) => !!tok);
  const { tokens: tokensWithBalance, loading: tokensWithBalanceLoading } = useTokensWithBalance();
  const wallet = useWallet();

  tokensWithBalance?.sort?.((a, b) => {
    if (a?.symbol > b?.symbol) return 1;
    else if (a?.symbol < b?.symbol) return -1;
    return 0;
  });

  featuredTokenInfos.sort((a, b) => {
    if (a?.symbol > b?.symbol) return 1;
    else if (a?.symbol < b?.symbol) return -1;
    return 0;
  });

  return (
    <>
      <Head>
        <HeaderTitle>Welcome to Aragon Voice</HeaderTitle>
        <HeaderSubtitle>
          Submit proposals for any ERC20 token and vote on them using a decentralized end-to-end
          verifiable layer 2.
          <br />
        </HeaderSubtitle>
        <HeaderAdvice>
          <HeaderAdviceText>
            Be aware proposals are only enforceable depending on the governance model of each
            protocol.
          </HeaderAdviceText>
        </HeaderAdvice>
        {/* NOTE temporarily removed this section, as it is not part of landing page's must 
        haves. VR 23-04-2021 */}
        {/* <SearchRow>
          <SearchField placeholder="ERC Token address..."/>
          <SearchButton disabled={false}>Find Token</SearchButton>
        </SearchRow> */}
      </Head>

      {/* TOP TOKENS */}
      <TokenSection>
        <SectionTitle
          title="Top Tokens"
          subtitle="Some of the most relevant tokens on Aragon Voice"
        />
        <If condition={tokenListLoading && !featuredTokenInfos?.length}>
          <Then>
            <LoadingRectangle message="Loading tokens" />
          </Then>
          <Else>
            <TokenList>
              {featuredTokenInfos.map(
                ({ icon, symbol, address, name, totalSupplyFormatted }: Partial<TokenInfo>) => (
                  <TokenCard
                    key={address}
                    name={symbol}
                    icon={icon}
                    rightText=""
                    href={address ? "/tokens/info#/" + address : ""}
                    tokenCap={totalSupplyFormatted}
                  >
                    <p>{shortTokenName(name) || "Loading..."}</p>
                  </TokenCard>
                )
              )}
            </TokenList>
          </Else>
        </If>

        <Row>
          <SecondaryButton href="/tokens">View all tokens</SecondaryButton>
        </Row>
      </TokenSection>

      {/* YOUR TOKENS */}
      <TokenSection>
        <SectionTitle title="Tokens you hold" subtitle="Compatible tokens in your wallet" />

        <If condition={!wallet?.ethereum || !wallet?.account}>
          <Then>
            <NotConnected connectMessage="Connect your account and discover the proposals related to your tokens" />
          </Then>
          <Else>
            <If condition={tokensWithBalance?.length}>
              <Then>
                {/* Tokens available */}
                <TokenList>
                  {tokensWithBalance.map(
                    ({ symbol, address, name, totalSupplyFormatted, icon }: Partial<TokenInfo>) => (
                      <TokenCard
                        key={address}
                        name={symbol}
                        icon={icon}
                        rightText=""
                        href={address ? "/tokens/info#/" + address : ""}
                        tokenCap={totalSupplyFormatted}
                      >
                        <p>{shortTokenName(name) || "Loading..."}</p>
                      </TokenCard>
                    )
                  )}
                </TokenList>
              </Then>
              <Else>
                {/* No tokens with balance */}
                <When condition={tokensWithBalanceLoading}>
                  <LoadingRectangle message="Loading tokens" />
                </When>
                <Unless condition={tokensWithBalanceLoading}>
                  <GrayRectangle>
                    <GreyInfo>No tokens found</GreyInfo>
                    <Link href="/tokens/add">
                      <NotListedLink>Register a token</NotListedLink>
                    </Link>
                  </GrayRectangle>
                </Unless>
              </Else>
            </If>
          </Else>
        </If>
        <br />
      </TokenSection>
    </>
  );
};

const Head = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: url(${LANDING_PAGE_CTA});
  -webkit-background-size: cover;
  -moz-background-size: cover;
  -o-background-size: cover;
  background-size: cover;
  width: 100%;
  min-height: 335px;
  border-radius: 16px;
  color: ${({ theme }) => theme.blackAndWhite.w1};
  font-family: "Manrope", sans-serif !important;
  @media ${({ theme }) => theme.screens.tablet} {
    width: calc(100% + 30px);
    border-radius: 0;
    margin: 0 -15px;
  }
  box-sizing: border-box;
  padding: 50px 15px;
`;

const HeaderTitle = styled.h4`
  font-family: "Manrope", sans-serif !important;
  font-style: normal;
  font-weight: 600;
  margin: 0;
  text-align: center;
  letter-spacing: -0.03em;
  box-sizing: border-box;
  font-size: 44px;
  line-height: 60px;

  @media ${({ theme }) => theme.screens.tablet} {
    font-size: 38px;
    line-height: 46px;

    padding: 0 50px;
  }
`;

const HeaderSubtitle = styled.p`
  font-family: "Manrope", sans-serif !important;
  font-style: normal;
  font-weight: 500;
  font-size: 18px;
  line-height: 150%;
  text-align: center;
  padding: 0 32px;
`;

const HeaderAdvice = styled.p`
  max-width: 90%;
  padding: 0px 24px 0px 24px;
  margin-top: 0px;
  text-align: center;
  background: ${({ theme }) => theme.blackAndWhite.w1}33;
  backdrop-filter: blur(24px);
  border-radius: 30px;
  @media ${({ theme }) => theme.screens.tablet} {
    width: 100%;
    height: 100%;
  }
`;

const HeaderAdviceText = styled.p`
  margin-top: 6px;
  margin-bottom: 6px;
  text-align: center;
  font-weight: 500;
  font-size: 16px;
  color: ${({ theme }) => theme.headerAdviceText.c1};
  @media ${({ theme }) => theme.screens.tablet} {
    font-size: 14px;
    width: 100%;
    height: 100%;
    text-align: center;
  }
`;

const Row = styled.div`
  display: flex;
  justify-content: center};
  margin-top: 40px;

  @media ${({ theme }) => theme.screens.tablet} {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
`;

const TokenSection = styled.div`
  padding-top: 30px;
`;

const GreyInfo = styled.p`
  max-width: 98%;
  text-align: center;
  font-size: 18px;
  @media ${({ theme }) => theme.screens.tablet} {
    font-size: 16px;
    width: 100%;
    height: 100%;
    text-align: center;
  }
`;

const NotListedLink = styled.p`
  color: ${({ theme }) => theme.primary.p1};
  text-align: center;
  cursor: pointer;
  margin-top: 0px;

  &:hover {
    color: ${({ theme }) => theme.gradients.primary.mg1_soft.c1};
  }
`;

export default withRouter(IndexPage);
