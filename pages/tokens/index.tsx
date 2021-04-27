import React from "react";
import styled from "styled-components";

import { useTokens } from "../../lib/hooks/tokens";
import { useRegisteredTokens } from "../../lib/hooks/registered-tokens";
import { FALLBACK_TOKEN_ICON } from "../../lib/constants";

import TokenCard from "../../components/token-card";
import SectionTitle from "../../components/sectionTitle";
import Button from "../../components/button";
import SearchWidget from "../../components/searchWidget";

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

const RegisterButton = styled(Button)`
  width: 200px;
  height: 46px;
  background: ${({ theme }) => theme.blackAndWhite.w1};
  color: ${({ theme }) => theme.primary.p1};
  box-shadow: ${({ theme }) => theme.shadows.buttonShadow};
  border: 2px solid #EFF1F7;
  border-radius: 8px;
  padding: 12px 20px;
  margin-left: 10px;
  font-size: 16px;
  line-height: 22px;
`;


// MAIN COMPONENT
const TokensPage = () => {
  const { registeredTokens: tokenAddrs, error: tokenListError } = useRegisteredTokens();
  // const [tokenAddrs, setTokenAddrs] = useState(registeredTokens)  // TODO: Allow filtering => setTokenAddrs( [myTokenAddr] )
  const tokenInfos = useTokens(tokenAddrs);

  return (
    <div>
      <TokenSection>
        <SectionTitle title="All Tokens" subtitle="All the tokens on the platform" />
        <br/>
        <div style={{ display: "flex", justifyContent: "space-between"}}>
          {/* NOTE temporarily removed search bar, as it is not part of the page's must 
      haves. VR 23-04-2021 */}
          {/* <SearchWidget /> */}
          <p></p>
          <RegisterButton href="/tokens/add">My Token is not listed</RegisterButton>
        </div>
        <br/>
        <TokenList>
          {tokenAddrs.map((tokenAddr) => (
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
      </TokenSection>
    </div>
  );
};

export default TokensPage;

//////////////////////////////////////////////////////////////////////////////////////////
// Leaving old implementation here for reference. Should be deleted ASAP. VR 23-04-2021 //
//////////////////////////////////////////////////////////////////////////////////////////

import { TopSection } from "../../components/top-section";
import Link from "next/link";

const Container = styled.div`
  width: 100%;
`;

const NotListedMessage = styled.h6`
  color: ${({ theme }) => theme.blackAndWhite.b1};
  text-align: right;
  cursor: pointer;
  @media ${({ theme }) => theme.screens.tablet} {
    text-align: center;
  }
`;

const ActiveTokensDescription = styled.p`
  color: ${({ theme }) => theme.blackAndWhite.b1};
  @media ${({ theme }) => theme.screens.tablet} {
    text-align: center;
  }
`;

const ActiveTokens = styled.h2`
  @media ${({ theme }) => theme.screens.tablet} {
    text-align: center;
  }
`;

const OldTokensPage = () => {
  const { registeredTokens: tokenAddrs, error: tokenListError } = useRegisteredTokens();
  // const [tokenAddrs, setTokenAddrs] = useState(registeredTokens)  // TODO: Allow filtering => setTokenAddrs( [myTokenAddr] )
  const tokenInfos = useTokens(tokenAddrs);

  return (
    <Container>
      <TopSection
        title={"All Tokens"}
        description={"Click at the tokens you own and cast your votes"}
        Action={() => (
          <Link href="/tokens/add">
            <NotListedMessage>My token is not listed</NotListedMessage>
          </Link>
        )}
      />

      <ActiveTokens>Active tokens</ActiveTokens>
      <ActiveTokensDescription>
        Below are the processes belonging to tokens that you currently hold.
      </ActiveTokensDescription>

      <TokenList>
        {tokenAddrs
          .map((addr) => tokenInfos.get(addr))
          .map((token, idx) => (
            <TokenCard
              name={token?.symbol}
              icon={token?.icon || FALLBACK_TOKEN_ICON}
              rightText={""}
              href={token?.address ? "/tokens/info#/" + token?.address : ""}
              key={idx}
            >
              <p>
                {token?.name || "(loading)"}
                <br />
                {token?.totalSupply && <small>Total supply: {token?.totalSupplyFormatted}</small>}
              </p>
            </TokenCard>
          ))}
      </TokenList>
    </Container>
  );
};
