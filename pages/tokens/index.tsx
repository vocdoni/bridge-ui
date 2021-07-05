import React, { useState } from "react";
import styled from "styled-components";
import { Case, Default, Else, If, Switch, Then, When } from "react-if";
import Spinner from "react-svg-spinner";

import { useFilteredTokens } from "../../lib/hooks/tokens/useStoredTokens";
import { shortTokenName } from "../../lib/utils";
import { TokenInfo } from "../../lib/types";
import { useScrollTop } from "../../lib/hooks/useScrollTop";

import { TokenCard } from "../../components/token-card";
import SectionTitle from "../../components/sectionTitle";
import { PrimaryButton } from "../../components/ControlElements/button";
import { TokenList } from "../dashboard";
import { SearchBar } from "../../components/searchWidget";
import { LoadingRectangle } from "../../components/loading-rectangle";

const ButtonContainer = styled.div`
  display: flex;
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
  const { storedTokens, error, loading } = useFilteredTokens(term);
  const areTokensEmpty = !storedTokens?.length;

  storedTokens?.sort?.((a, b) => {
    if (a?.symbol > b?.symbol) return 1;
    else if (a?.symbol < b?.symbol) return -1;
    return 0;
  });

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
        <Case condition={areTokensEmpty && loading}>
          <LoadingRectangle message="Loading tokens" />
        </Case>
        <Case condition={areTokensEmpty}>{/* TODO add not token CTA */}</Case>
        <Default>
          <TokenList>
            {storedTokens.map(
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

export default TokensPage;
