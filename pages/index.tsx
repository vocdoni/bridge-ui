import React from "react";
import { withRouter } from "next/router";
import styled from "styled-components";

import TokenCard from "../components/token-card";
import Button from "../components/button";
import { featuredTokens } from "../lib/tokens";
import { useTokens } from "../lib/hooks/tokens";
import { FALLBACK_TOKEN_ICON } from "../lib/constants";
import { useIsMobile } from "../lib/hooks/useWindowSize";
import { TokenList } from "./dashboard";
import { newTheme_colors } from "../theme";

const Head = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: url('media/landingpage_header_backgroung.svg');
  width: 1248px;
  height: 335px;
  border-radius: 16px;
  color:${newTheme_colors.blackAndWhite.w1};
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


const SearchRow = styled.div`
  display: flex;  
  justify-content: space-between;
`;

const SearchField = styled.input`
  type: text;
  border: 2px solid #EFF1F7;
  box-sizing: border-box;
  box-shadow: inset 0px 2px 3px rgba(180, 193, 228, 0.35);
  border-radius: 8px;
  width: 394px;
  height: 46px;
  padding-left: 10px;
`;

const SearchButton = styled.button`
  background: linear-gradient(${newTheme_colors.gradients.primary.mg1.a}, ${newTheme_colors.gradients.primary.mg1.c1}, ${newTheme_colors.gradients.primary.mg1.c2});
  box-shadow: 0px 3px 3px rgba(100, 115, 155, 0.35);
  border-radius: 8px;
  color: ${newTheme_colors.blackAndWhite.w1};
  width: 140px;
  height: 46px;
  padding: 12px 20px;
  margin-left: 10px;
  font-size: 16px;
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

const TokenSectionTitle = styled.h4`
  margin-top: 0;
  margin-bottom: 9px;
  font-size: 38px;
  font-style: normal;
  font-weight: 500;
  line-height: 52px;
  letter-spacing: -0.03em;
  color: ${newTheme_colors.blackAndWhite.b1};
`;

const TokenSectionSubtitle = styled.p`
  margin-top: 0;
  margin-bottom: 9;
  line-height: 27px;
  color: #7483AB;
  font-size: 18px;
  font-style: normal;
  font-weight: 400;
`;


const ShowMoreButton = styled(Button)`
  width: 150px;
  height: 46px;
  color: ${newTheme_colors.primary.p1};
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
        <SearchRow>
          <SearchField placeholder="ERC Token address..."/>
          <SearchButton disabled={false}>Find Token</SearchButton>
        </SearchRow>
      </Head>

      <br />
      <br />

      {/* YOUR TOKENS */}
      <TokenSection>
        <TokenSectionTitle>Your Tokens</TokenSectionTitle>
        <TokenSectionSubtitle>Some of the tokens belonging to your wallet</TokenSectionSubtitle>
        
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
      <br />

      {/* TOP TOKENS */}
       <TokenSection>
          <TokenSectionTitle>Top Tokens</TokenSectionTitle>
          <TokenSectionSubtitle>Some of the most relevant tokens on the platform</TokenSectionSubtitle>
          
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
