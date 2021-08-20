import React, { useState } from "react";
import styled from "styled-components";
import { Case, Default, Switch } from "react-if";

import { shortTokenName } from "../../lib/utils";
import { TokenInfo } from "../../lib/types";
import { useScrollTop } from "../../lib/hooks/useScrollTop";
import { LOOKING_GLASS_IMG } from "../../lib/constants/url";
import { flex_row_large_column_small_mixin } from "../../lib/mixins";

import { TokenCard } from "../../components/token-card";
import SectionTitle from "../../components/sectionTitle";
import { PrimaryButton } from "../../components/ControlElements/button";
import { TokenList } from "../dashboard";
import { SearchBar } from "../../components/searchWidget";
import { Loading } from "../../components/Banners/GrayBanners";
import { tokenSorter } from "../../lib/tokens";
import { useFilteredTokens } from "../../lib/hooks/tokens/useFilteredTokens";

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

type NoTokenCtaProps = { searchTerm: string };

function NoTokensCta({ searchTerm }: NoTokenCtaProps) {
  const subtitle = `The token '${searchTerm}' is not yet registered on Voice`;
  return (
    <CenterAlign>
      <img src={LOOKING_GLASS_IMG} />
      <SectionTitle title="Token not found" subtitle={subtitle} />
      <PrimaryButton href="/tokens/add">Register token now</PrimaryButton>
    </CenterAlign>
  );
}

export default TokensPage;
