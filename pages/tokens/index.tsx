import React from "react";
import styled from "styled-components";

import TokenCard from "../../components/token-card";
import { useTokens, useRegisteredTokens } from "../../lib/hooks/tokens";
import { FALLBACK_TOKEN_ICON } from "../../lib/constants";

import SectionTitle from "../../components/sectionTitle";
import Button, { SecondaryButton } from "../../components/button";
import SearchWidget from "../../components/searchWidget";
import { shortTokenName } from "../../lib/utils";

const TokenList = styled.div`
  display: flex;
  flex-wrap: wrap;
  margin: 0 -1em;

  @media ${({ theme }) => theme.screens.tablet} {
    justify-content: center;
  }
`;

const TokenSection = styled.div`
  @media ${({ theme }) => theme.screens.tablet} {
    text-align: center;
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: space-between;
`;

// MAIN COMPONENT
const TokensPage = () => {
  const { registeredTokens: tokenAddrs, error: tokenListError } = useRegisteredTokens();
  // const [tokenAddrs, setTokenAddrs] = useState(registeredTokens)  // TODO: Allow filtering => setTokenAddrs( [myTokenAddr] )
  const tokenInfos = useTokens(tokenAddrs);

  return (
    <TokenSection>
      <SectionTitle title="All Tokens" subtitle="All the tokens on the platform" />
      <br />
      <ButtonContainer>
        {/* NOTE temporarily removed search bar, as it is not part of the page's must 
    haves. VR 23-04-2021 */}
        {/* <SearchWidget /> */}
        <p></p>
        <SecondaryButton href="/tokens/add">My token is not listed</SecondaryButton>
      </ButtonContainer>
      <br />
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
    </TokenSection>
  );
};

export default TokensPage;
