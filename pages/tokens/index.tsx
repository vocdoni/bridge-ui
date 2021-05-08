import React from "react";
import styled from "styled-components";

import TokenCard from "../../components/token-card";
import { useTokens, useRegisteredTokens } from "../../lib/hooks/tokens";
import { FALLBACK_TOKEN_ICON } from "../../lib/constants";

import SectionTitle from "../../components/sectionTitle";
import { SecondaryButton } from "../../components/button";
import { shortTokenName } from "../../lib/utils";
import { TokenInfo } from "../../lib/types";
import { useScrollTop } from "../../lib/hooks/useScrollTop";

const TokenList = styled.div`
  display: flex;
  flex-wrap: wrap;

  @media ${({ theme }) => theme.screens.tablet} {
    justify-content: center;
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 25px;
  @media ${({ theme }) => theme.screens.tablet} {
    margin-bottom: unset;
  }
`;

const Top = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  box-sizing: border-box;

  @media ${({ theme }) => theme.screens.tablet} {
    margin-bottom: unset;
    display: unset;
    justify-content: unset;
  }
`;

// MAIN COMPONENT
const TokensPage = () => {
  useScrollTop();
  const { registeredTokens: tokenAddrs, error: tokenListError } = useRegisteredTokens();
  // const [tokenAddrs, setTokenAddrs] = useState(registeredTokens)  // TODO: Allow filtering => setTokenAddrs( [myTokenAddr] )
  const tokenInfos = useTokens(tokenAddrs);

  tokenInfos?.sort?.((a, b) => {
    if (a?.symbol > b?.symbol) return 1;
    else if (a?.symbol < b?.symbol) return -1;
    return 0;
  });

  return (
    <div>
      <Top>
        <SectionTitle title="All Tokens" subtitle="All the tokens on the platform" />
        <ButtonContainer>
          {/* NOTE temporarily removed search bar, as it is not part of the page's must 
    haves. VR 23-04-2021 */}
          {/* <SearchWidget /> */}
          <SecondaryButton href="/tokens/add">My Token is not listed</SecondaryButton>
        </ButtonContainer>
      </Top>
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
    </div>
  );
};

export default TokensPage;
