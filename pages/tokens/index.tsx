import React from "react";
import styled from "styled-components";
import Link from "next/link";

import TokenCard from "../../components/token-card";
import { useTokens } from "../../lib/hooks/tokens";
import { useRegisteredTokens } from "../../lib/hooks/registered-tokens";
import { FALLBACK_TOKEN_ICON } from "../../lib/constants";
import { TopSection } from "../../components/top-section";

const Container = styled.div`
    width: 100%;
`;

const NotListedMessage = styled.h6`
    color: ${({ theme }) => theme.accent1};
    text-align: right;
    cursor: pointer;
    @media ${({ theme }) => theme.screens.tablet} {
        text-align: center;
    }
`;

const ActiveTokensDescription = styled.p`
    color: ${({ theme }) => theme.lightText};
    @media ${({ theme }) => theme.screens.tablet} {
        text-align: center;
    }
`;

const ActiveTokens = styled.h2`
    @media ${({ theme }) => theme.screens.tablet} {
        text-align: center;
    }
`;

const TokenList = styled.div`
    display: flex;
    flex-wrap: wrap;
    margin: 0 -1em;

    @media ${({ theme }) => theme.screens.tablet} {
        justify-content: center;
    }
`;

// MAIN COMPONENT
const TokensPage = () => {
    const {
        registeredTokens: tokenAddrs,
        error: tokenListError,
    } = useRegisteredTokens();
    // const [tokenAddrs, setTokenAddrs] = useState(registeredTokens)  // TODO: Allow filtering => setTokenAddrs( [myTokenAddr] )
    const tokenInfos = useTokens(tokenAddrs);

    return (
        <Container>
            <TopSection
                title={"All Tokens"}
                description={"Click at the tokens you own and cast your votes"}
                Action={() => (
                    <Link href="/tokens/add">
                        <NotListedMessage>
                            My token is not listed
                        </NotListedMessage>
                    </Link>
                )}
            />

            <ActiveTokens>Active tokens</ActiveTokens>
            <ActiveTokensDescription>
                Below are the processes belonging to tokens that you currently
                hold.
            </ActiveTokensDescription>

            <TokenList>
                {tokenAddrs
                    .map((addr) => tokenInfos.get(addr))
                    .map((token, idx) => (
                        <TokenCard
                            name={token?.symbol}
                            icon={token?.icon || FALLBACK_TOKEN_ICON}
                            rightText={""}
                            href={
                                token?.address
                                    ? "/tokens/info#/" + token?.address
                                    : ""
                            }
                            key={idx}
                        >
                            <p>
                                {token?.name || "(loading)"}
                                <br />
                                {token?.totalSupply && (
                                    <small>
                                        Total supply:{" "}
                                        {token?.totalSupplyFormatted}
                                    </small>
                                )}
                            </p>
                        </TokenCard>
                    ))}
            </TokenList>
        </Container>
    );
};

export default TokensPage;
