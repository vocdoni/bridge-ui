import React, { useState } from "react";
import styled from "styled-components";
import { When } from "react-if";
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
  const { storedTokens, error: tokenListError, loading: tokenListLoading } = useFilteredTokens(
    term
  );

  storedTokens?.sort?.((a, b) => {
    if (a?.symbol > b?.symbol) return 1;
    else if (a?.symbol < b?.symbol) return -1;
    return 0;
  });

  const doNothing = () => {};

  return (
    <>
      <SectionTitle title="All Tokens" subtitle="All the tokens on the platform" />
      <ButtonContainer>
        <VariableWidthDiv>
          <SearchBar
            placeholder={"Search token symbol, name, or address"}
            onChange={(e) => setTerm(e.target.value)}
            onKeyDown={doNothing}
          />
        </VariableWidthDiv>
        <PrimaryButton href="/tokens/add">Register a token</PrimaryButton>
      </ButtonContainer>
      <TokenList>
        <When condition={!storedTokens?.length && tokenListLoading}>
          <RenderEmpty />
        </When>

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
    </>
  );
};

// TODO: Render a better UI
function RenderEmpty() {
  return (
    <>
      <br />
      <p>
        Loading tokens... <Spinner />
      </p>
    </>
  );
}

export default TokensPage;
