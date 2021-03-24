import React, { useState } from "react";
import Link from "next/link";
import { withRouter, useRouter } from "next/router";
import { IconEthereum, LoadingRing } from "@aragon/ui";
import { ChainUnsupportedError, useWallet, Wallet } from "use-wallet";
import styled, { CSSProperties, useTheme } from "styled-components";
import { usePool } from "@vocdoni/react-hooks";
// import Spinner from "react-svg-spinner"

import TokenCard from "../components/token-card";
import Button from "../components/button";
import { featuredTokens } from "../lib/tokens";
import { INVALID_CHAIN_ID, METAMASK_IS_NOT_AVAILABLE } from "../lib/errors";
import { useTokens } from "../lib/hooks/tokens";
import { FALLBACK_TOKEN_ICON } from "../lib/constants";
import { useMessageAlert } from "../lib/hooks/message-alert";
import { useIsMobile } from "../lib/hooks/useWindowSize";
import { TokenList } from "./dashboard";

const Head = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
`;

const Title = styled.h1`
    margin-bottom: 5px;
    text-align: center;
`;

const Subtitle = styled.h4`
    margin-top: 5px;
    font-size: 20px;
    text-align: center;
    max-width: 300px;
    color: ${({ theme }) => theme.accent1};
`;

const Row = styled.div`
    display: flex;
    align-items: ${({ alignItems }: CSSProperties) => alignItems};
    justify-content: ${({ justifyContent }) => justifyContent};

    @media ${({ theme }) => theme.screens.tablet} {
        flex-direction: column;
        align-items: center;
        text-align: center;
    }
`;

const LeftSection = styled.div`
    max-width: ${({ maxWidth }: CSSProperties) => maxWidth};
    width: ${({ width }) => width};

    @media ${({ theme }) => theme.screens.tablet} {
        max-width: 100%;
    }
`;

const RightSection = styled.div`
    width: ${({ width }: CSSProperties) => width};
    text-align: ${({ textAlign }) => textAlign};
    max-width: ${({ maxWidth }) => maxWidth};

    @media ${({ theme }) => theme.screens.tablet} {
        max-width: 100%;
    }
`;

const ConnectButton = styled(Button)`
    margin: 15px auto;
    max-width: 300px;
    @media ${({ theme }) => theme.screens.tablet} {
        max-width: 100%;
    }
`;

const Description = styled.h4`
    font-size: 20px;
    margin-bottom: 10px;
`;

const ColorText = styled.span`
    color: ${({ theme }) => theme.accent1};
`;

const GreyCircle = styled.div`
    background-color: #ccc;
    border-radius: 50%;
    height: 140px;
    width: 140px;
`;

const TopTokensContainer = styled.div`
    @media ${({ theme }) => theme.screens.tablet} {
        text-align: center;
    }
`;

const ShowMoreButton = styled(Button)`
    min-width: 200px;
`;

const ClickableLink = styled.a`
    color: ${({ theme }) => theme.accent1};
    text-decoration: none;
`;

//@TODO: This will be improved with the Wallet Modal PR
export const HandleConnector = () => {
    const { setAlertMessage } = useMessageAlert();
    const [connecting, setConnecting] = useState(false);
    const router = useRouter();
    const { pool, loading: poolLoading } = usePool();
    const wallet = useWallet();

    const isConnected = wallet.status == "connected";
    const onSignIn = () => {
        if (pool && isConnected) {
            return router.push("/dashboard");
        }

        setConnecting(true);

        return wallet
            .connect("injected")
            .then(() => {
                if (!wallet.connectors.injected)
                    throw new Error(METAMASK_IS_NOT_AVAILABLE);
                router.push("/dashboard");
            })
            .catch((err) => {
                setConnecting(false);

                if (
                    (err && err.message == INVALID_CHAIN_ID) ||
                    err instanceof ChainUnsupportedError
                ) {
                    const msg = "Please, switch to the {{NAME}} network".replace(
                        "{{NAME}}",
                        process.env.ETH_NETWORK_ID
                    );
                    return setAlertMessage(msg);
                } else if (err && err.message == METAMASK_IS_NOT_AVAILABLE) {
                    return setAlertMessage(
                        "Please, install Metamask or a Web3 compatible wallet"
                    );
                }
                console.error(err);
                setAlertMessage(
                    "Could not access Metamask or connect to the network"
                );
            });
    };

    if (poolLoading || connecting) {
        const connectingToVocdoni = "Conneting to Vocdoni";
        const connectingToWeb3 = "Connecting to " + wallet.networkName;
        const label = poolLoading ? connectingToVocdoni : connectingToWeb3;
        return (
            <ConnectButton
                label={label}
                icon={<LoadingRing />}
                wide
                onClick={wallet.reset}
            />
        );
    }

    return (
        <ConnectButton
            label={isConnected ? "Show dashboard" : "Connect with MetaMask"}
            icon={<IconEthereum />}
            wide
            mode="strong"
            onClick={onSignIn}
        />
    );
};

// MAIN COMPONENT
const IndexPage = () => {
    const tokenInfos = useTokens(featuredTokens);
    const isMobile = useIsMobile();

    return (
        <div>
            <Head>
                <Title>Bridge</Title>
                <Subtitle>Trustless governance for Token holders</Subtitle>
            </Head>

            <Row alignItems="center">
                <LeftSection maxWidth="60%">
                    <Description>
                        Submit proposals for <ColorText>ERC20</ColorText> tokens
                        and vote on them using a decentralized end-to-end
                        verifiable <ColorText>layer 2</ColorText> blockchain.{" "}
                    </Description>
                    <p>
                        <small>
                            <Link
                                href="https://ethereum.org/en/developers/docs/standards/tokens/erc-20/"
                                passHref
                            >
                                <ClickableLink target="_blank">
                                    What is an ERC20 Token?
                                </ClickableLink>
                            </Link>
                        </small>
                    </p>
                </LeftSection>
                {isMobile ? null : (
                    <RightSection width="100%" textAlign="center">
                        <HandleConnector />
                    </RightSection>
                )}
            </Row>

            <br />
            <br />

            <Row alignItems="center" justifyContent="space-around">
                <LeftSection width="150px">
                    <GreyCircle />
                </LeftSection>
                <RightSection maxWidth="60%">
                    <h2>Speak up</h2>
                    <h4>
                        Find your token on the list and vote on the decisions
                        that will make it grow. Be the first one to register it
                        if it doesn’t exist and create your first proposal.
                    </h4>
                    <p>
                        <small>
                            <Link
                                passHref
                                href="https://ethereum.org/en/developers/docs/standards/tokens/erc-20/"
                            >
                                <ClickableLink target="_blank">
                                    Learn more
                                </ClickableLink>
                            </Link>
                        </small>
                    </p>
                </RightSection>
            </Row>

            <br />
            <br />

            <TopTokensContainer>
                <h2>Top Tokens</h2>
                <p>
                    Below is a list of some of the most relevant tokens on the
                    platform
                </p>
            </TopTokensContainer>

            <TokenList>
                {featuredTokens.map((tokenAddr) => (
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

            <br />
            <br />

            <Row justifyContent={"space-around"}>
                <ShowMoreButton href="/tokens">
                    Show more
                </ShowMoreButton>
            </Row>
        </div>
    );
};

export default withRouter(IndexPage);
