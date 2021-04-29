import React from "react";
import { withRouter } from "next/router";
import styled from "styled-components";

import { featuredTokens } from "../lib/tokens";
import { useTokens } from "../lib/hooks/tokens";
import { FALLBACK_TOKEN_ICON, LANDING_PAGE_CTA } from "../lib/constants";
import { useIsMobile } from "../lib/hooks/useWindowSize";
import { TokenList } from "./dashboard";

import TokenCard from "../components/token-card";
import { SecondaryButton } from "../components/button";
import SectionTitle from "../components/sectionTitle";
import { shortTokenName } from "../lib/utils";
import { TokenInfo } from "../lib/types";

const Head = styled.div`
  width: 1248px;
  height: 335px;
  margin-left: auto;
  margin-right: auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: url(${LANDING_PAGE_CTA});
  border-radius: 16px;
  color: ${({ theme }) => theme.blackAndWhite.w1};
  font-family: "Manrope";
`;

const HeaderTitle = styled.h4`
  font-style: normal;
  font-weight: 600;
  line-height: 60px;
  margin: 0px;
  text-align: center;
  letter-spacing: -0.03em;
`;

const HeaderSubtitle = styled.p`
  width: 526px;
  text-align: center;
  line-height: 150%;
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
  @media ${({ theme }) => theme.screens.tablet} {
    text-align: center;
  }
`;

// MAIN COMPONENT
const IndexPage = () => {
  const featuredTokenIds: string[] = featuredTokens[process.env.ETH_NETWORK_ID] || [];
  const tokenInfos = useTokens(featuredTokenIds);
  const isMobile = useIsMobile();

  return (
    <>
      <Head>
        <HeaderTitle>Welcome to Aragon Voice</HeaderTitle>
        <HeaderSubtitle>
          Submit proposals for any ERC20 token and vote on them using a decentralized end-to-end
          verifiable layer 2.
          <br />
          Be aware proposals are only enforceable depending on the governance model of each
          protocol.
        </HeaderSubtitle>
        {/* NOTE temporarily removed this section, as it is not part of landing page's must 
        haves. VR 23-04-2021 */}
        {/* <SearchRow>
          <SearchField placeholder="ERC Token address..."/>
          <SearchButton disabled={false}>Find Token</SearchButton>
        </SearchRow> */}
      </Head>

      <br />
      <br />

      {/* NOTE temporarily removed this section, as it is not part of landing page's must 
      haves. Should be implemented later, along with the fallback screens. VR 23-04-2021 */}
      {/* YOUR TOKENS */}
      {/* <TokenSection>
        <SectionTitle title="Your Tokens" subtitle="Some of the tokens belonging to your wallet" />
        <TokenList>
          {featuredTokenIds.map((tokenAddr) => (
            <TokenCard
              key={tokenAddr}
              name={tokenInfos.get(tokenAddr)?.symbol}
              icon={FALLBACK_TOKEN_ICON}
              rightText=""
              href={tokenAddr ? "/tokens/info#/" + tokenAddr : ""}
            >
              <p>{tokenInfos.get(tokenAddr)?.name || "(loading)"}</p>
            </TokenCard>
          ))}
        </TokenList>
        <Row>
          <ShowMoreButton href="/tokens">View all tokens</ShowMoreButton>
        </Row>
      </TokenSection>

      <br />
      <br /> */}

      {/* TOP TOKENS */}
      <TokenSection>
        <SectionTitle
          title="Top Tokens"
          subtitle="Some of the most relevant tokens on the platform"
        />
        <TokenList>
          {tokenInfos.map(({ symbol, address, name, totalSupplyFormatted }: Partial<TokenInfo>) => (
            <TokenCard
              key={address}
              name={symbol}
              icon={FALLBACK_TOKEN_ICON}
              rightText=""
              href={address ? "/tokens/info#/" + address : ""}
              tokenCap={totalSupplyFormatted}
            >
              <p>{shortTokenName(name) || "Loading..."}</p>
            </TokenCard>
          ))}
        </TokenList>
        <Row>
          <SecondaryButton href="/tokens">View all tokens</SecondaryButton>
        </Row>
      </TokenSection>
    </>
  );
};

export default withRouter(IndexPage);
