import React from "react";
import styled from "styled-components";

import TokenCard from "../../components/token-card";
import { useTokens, useRegisteredTokens, useUserTokens } from "../../lib/hooks/tokens";
import { FALLBACK_TOKEN_ICON } from "../../lib/constants";

import SectionTitle from "../../components/sectionTitle";
import Button, { SecondaryButton } from "../../components/button";
import SearchWidget from "../../components/searchWidget";
import { shortTokenName } from "../../lib/utils";
import { TokenInfo } from "../../lib/types";

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

const FindTokenButton = styled(Button)`
  width: 200px;
  height: 46px;
  background: ${({ theme }) => theme.blackAndWhite.w1};
  color: ${({ theme }) => theme.primary.p1};
  box-shadow: ${({ theme }) => theme.shadows.buttonShadow};
  border: 2px solid #eff1f7;
  border-radius: 8px;
  padding: 12px 20px;
  margin-left: 10px;
  font-size: 16px;
  line-height: 22px;
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
        <FindTokenButton href="/tokens/add">My Token is not listed</FindTokenButton>
      </ButtonContainer>
      <br />
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
    </TokenSection>
  );
};

export default TokensPage;
