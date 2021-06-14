import React from "react";
import styled from "styled-components";
import { When } from "react-if";
import Spinner from "react-svg-spinner";

import { useStoredTokens } from "../../lib/hooks/tokens";
import { shortTokenName } from "../../lib/utils";
import { TokenInfo } from "../../lib/types";
import { useScrollTop } from "../../lib/hooks/useScrollTop";

import { TokenCard } from "../../components/token-card";
import SectionTitle from "../../components/sectionTitle";
import { SecondaryButton } from "../../components/ControlElements/button";
import { TokenList } from "../dashboard";

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
  const { storedTokens, error: tokenListError, loading: tokenListLoading } = useStoredTokens();
  // const [tokenAddrs, setTokenAddrs] = useState(storedTokens)  // TODO: Allow filtering => setTokenAddrs( [myTokenAddr] )

  storedTokens?.sort?.((a, b) => {
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
          <SecondaryButton href="/tokens/add">Register a token</SecondaryButton>
        </ButtonContainer>
      </Top>
      <TokenList>
        <When condition={!storedTokens?.length && tokenListLoading}>
          <div>{renderEmpty()}</div>
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
    </div>
  );
};

// TODO: Render a better UI
function renderEmpty() {
  return (
    <div>
      <br />
      <p>
        Loading tokens... <Spinner />
      </p>
    </div>
  );
}

export default TokensPage;
