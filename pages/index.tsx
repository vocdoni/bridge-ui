import React from "react";
import { withRouter } from "next/router";
import styled from "styled-components";

import { featuredTokens } from "../lib/tokens";
import { useTokens, useUserTokens } from "../lib/hooks/tokens";
import { FALLBACK_TOKEN_ICON, LANDING_PAGE_CTA, LIGHTNING_BOLT } from "../lib/constants";
import { TokenList } from "./dashboard";

import TokenCard from "../components/token-card";
import { SecondaryButton } from "../components/button";
import SectionTitle from "../components/sectionTitle";
import { shortTokenName } from "../lib/utils";

import Link from "next/link";
import { useWallet } from "use-wallet";
import { ConnectButton } from "../components/connect-button";

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

const ShowMoreButton = styled(Button)`
  width: 150px;
  height: 46px;
  color: ${({ theme }) => theme.primary.p1};
  padding: 12px 20px;
  background: #ffffff;
  box-sizing: border-box;
  box-shadow: ${({ theme }) => theme.shadows.buttonShadow};
  border: 2px solid #eff1f7;
  border-radius: 8px;
`;

const GrayRectangle = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: ${({ theme }) => theme.grayScale.g2};
  width: 1248px;
  height: 161px;
  border-radius: 16px;
  color: ${({ theme }) => theme.grayScale.g5};
  font-family: "Manrope";
`;

const GrayRectangleTall = styled(GrayRectangle)`
  height: 227px;
`;

const LightningBolt = styled.div`
  margin: 15px auto;
  background: url(${LIGHTNING_BOLT});
  background-repeat: no-repeat;
  width: 52px;
  height: 54px;
`;

const GreyInfo = styled.p`
  width: 600px;
  text-align: center;
  line-height: 0%;
`;

const NotListedLink = styled.p`
  color: ${({ theme }) => theme.primary.p1};
  width: 526px;
  text-align: center;
  line-height: 0%;
  cursor: pointer;
`;

// MAIN COMPONENT
const IndexPage = () => {
  const featuredTokenIds: string[] = featuredTokens[process.env.ETH_NETWORK_ID] || [];
  const tokenInfos = useTokens(featuredTokenIds);
  const wallet = useWallet();
  const userTokens = useUserTokens();

  return (
    <>
      <Head>
        <HeaderTitle>Welcome to Aragon Voice</HeaderTitle>
        <HeaderSubtitle>
          Submit proposals for any ERC20 token and vote on them using a decentralized end-to-end
          verifiable layer 2.
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

      {/* YOUR TOKENS */}
      <TokenSection>
        <SectionTitle
          title="Tokens you hold"
          subtitle="Some of the tokens belonging to your wallet"
        />
        {!wallet?.ethereum || !wallet?.account ? (
          <GrayRectangleTall>
            <LightningBolt />
            <GreyInfo>
              Connect your account and discover the proposals related to your tokens
            </GreyInfo>
            <ConnectButton />
          </GrayRectangleTall>
        ) : !userTokens.userTokens ? (
          <GrayRectangle>
            <GreyInfo>Loading...</GreyInfo>
          </GrayRectangle>
        ) : userTokens.userTokens.length ? (
          <TokenList>
            {userTokens.userTokens.map(({ symbol, address, name }) => (
              <TokenCard
                key={address}
                name={symbol}
                icon={FALLBACK_TOKEN_ICON}
                rightText=""
                href={address ? "/tokens/info#/" + address : ""}
              >
                <p>{name || "Loading..."}</p>
              </TokenCard>
            ))}
          </TokenList>
        ) : (
          <GrayRectangle>
            <GreyInfo>No tokens here</GreyInfo>
            <Link href="/tokens/add">
              <NotListedLink>My token is not listed</NotListedLink>
            </Link>
          </GrayRectangle>
        )}
      </TokenSection>

      <br />
      <br />

      {/* TOP TOKENS */}
      <TokenSection>
        <SectionTitle
          title="Top Tokens"
          subtitle="Some of the most relevant tokens on the platform"
        />
        <TokenList>
          {tokenInfos.map(({ symbol, address, name }) => (
            <TokenCard
              key={address}
              name={symbol}
              icon={FALLBACK_TOKEN_ICON}
              rightText=""
              href={address ? "/tokens/info#/" + address : ""}
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
