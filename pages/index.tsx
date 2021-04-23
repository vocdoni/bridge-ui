import React from "react";
import { withRouter } from "next/router";
import styled from "styled-components";

import { featuredTokens } from "../lib/tokens";
import { useTokens } from "../lib/hooks/tokens";
import { FALLBACK_TOKEN_ICON, LANDING_PAGE_CTA } from "../lib/constants";
import { useIsMobile } from "../lib/hooks/useWindowSize";
import { TokenList } from "./dashboard";

import TokenCard from "../components/token-card";
import Button from "../components/button";
import SectionTitle from "../components/sectionTitle";

const Head = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: url(${LANDING_PAGE_CTA});
  width: 1248px;
  height: 335px;
  border-radius: 16px;
  color: ${({ theme }) => theme.blackAndWhite.w1};
  font-family: "Manrope"
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

const ShowMoreButton = styled(Button)`
  width: 150px;
  height: 46px;
  color: ${({ theme }) => theme.primary.p1};
  padding: 12px 20px;
  background: #FFFFFF;
  box-sizing: border-box;
  box-shadow: 0px 3px 3px rgba(180, 193, 228, 0.35);
  border: 2px solid #EFF1F7;
  border-radius: 8px;
`;

// MAIN COMPONENT
const IndexPage = () => {
  const featuredTokenIds: string[] = featuredTokens[process.env.ETH_NETWORK_ID] || [];
  const tokenInfos = useTokens(featuredTokenIds);
  const isMobile = useIsMobile();

  return (
    <div>
      <Head>
        <HeaderTitle>Welcome to Aragon Voice</HeaderTitle>
        <HeaderSubtitle>Submit proposals for any ERC20 token and vote on them using a decentralized end-to-end verifiable layer 2.</HeaderSubtitle>
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
          <SectionTitle title="Top Tokens" subtitle="Some of the most relevant tokens on the platform" />
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
    </div>
  );
};

export default withRouter(IndexPage);
