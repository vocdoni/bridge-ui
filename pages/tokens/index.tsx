import React, { useState } from "react";
import styled from "styled-components";
import { Case, Default, Else, If, Switch, Then } from "react-if";

import { shortTokenName } from "../../lib/utils";
import { TokenInfo } from "../../lib/types";
import { tokenSorter } from "../../lib/tokens";
import { flex_row_large_column_small_mixin } from "../../lib/mixins";
import { useScrollTop } from "../../lib/hooks/useScrollTop";
import { useFilteredTokens } from "../../lib/hooks/tokens";
import { LOOKING_GLASS_IMG } from "../../lib/constants/url";
import { useTokensWithBalance } from "../../lib/contexts/tokens";
import { GrayRectangle } from "../../components/Banners/styled";


import { TokenCard } from "../../components/token-card";
import SectionTitle from "../../components/sectionTitle";
import { PrimaryButton } from "../../components/ControlElements/button";
import { TokenList } from "../dashboard";
import { SearchBar } from "../../components/searchWidget";
import { Loading,NotConnected } from "../../components/Banners/GrayBanners";
import Link from "next/link";


const ButtonContainer = styled.div`
  ${flex_row_large_column_small_mixin}
  justify-content: space-between;
  margin-bottom: 25px;

  @media ${({ theme }) => theme.screens.tablet} {
    margin-bottom: unset;
  }
`;

const VariableWidthDiv = styled.div`
  width: 50%;

  @media ${({ theme }) => theme.screens.tablet} {
    width: 100%;
  }
`;

// MAIN COMPONENT
const TokensPage = () => {
  useScrollTop();
  const [term, setTerm] = useState("");
  const { data: filteredTokens, isLoading } = useFilteredTokens(term);
  const areTokensEmpty = !filteredTokens?.length;

  filteredTokens?.sort?.(tokenSorter);

  const tokensWithBalance = useTokensWithBalance();

  const isWalletConnected = status === "connected";
  const hasTokenWithBalance = tokensWithBalance?.data?.length;

  if (hasTokenWithBalance) {
    tokensWithBalance.data.sort(tokenSorter);
  }

  return (
    <>
      <SectionTitle title="All Tokens" subtitle="All the tokens on the platform" />
      <ButtonContainer>
        <VariableWidthDiv>
          <SearchBar
            placeholder={"Search token symbol, name, or address"}
            onChange={(e) => setTerm(e.target.value)}
          />
        </VariableWidthDiv>
        <PrimaryButton href="/tokens/add">Register a token</PrimaryButton>
      </ButtonContainer>
      <Switch>
        <Case condition={areTokensEmpty && isLoading}>
          <Loading message="Loading tokens..." />
        </Case>
        <Case condition={areTokensEmpty}>
          <NoTokensCta searchTerm={term} />
        </Case>
        <Default>
          <TokenList>
            {filteredTokens.map(
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
        </Default>
      </Switch>
      {/* YOUR TOKENS */}
      <TokenSection>
        <SectionTitle title="Tokens you hold" subtitle="Compatible tokens in your wallet" />
        <Switch>
          <Case condition={!isWalletConnected}>
            <NotConnected connectMessage="Connect your account and discover the proposals related to your tokens" />
          </Case>
          <Case condition={tokensWithBalance.isLoading}>
            <Loading message="Loading tokens..." />
          </Case>
          <Case condition={hasTokenWithBalance}>
            <TokenList>
              {tokensWithBalance.data.map(
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
          </Case>
          <Default>
            <GrayRectangle>
              <GreyInfo>No tokens found</GreyInfo>
              <Link href="/tokens/add">
                <NotListedLink>Register a token</NotListedLink>
              </Link>
            </GrayRectangle>
          </Default>
        </Switch>
      </TokenSection>
    </>
  );
};

const CenterAlign = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding-top: 40px;
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

type NoTokenCtaProps = { searchTerm: string };

function NoTokensCta({ searchTerm }: NoTokenCtaProps) {
  const subtitle = `The token '${searchTerm}' is not yet registered on Voice`;
  return (
    <CenterAlign>
      <img src={LOOKING_GLASS_IMG} />
      <If condition={!!searchTerm}>
        <Then>
          <SectionTitle title="Token not found" subtitle={subtitle} />
        </Then>
        <Else>
          <SectionTitle title="No tokens found" subtitle="" />
        </Else>
      </If>
      <PrimaryButton href="/tokens/add">Register token now</PrimaryButton>
    </CenterAlign>
  );
}

export default TokensPage;
