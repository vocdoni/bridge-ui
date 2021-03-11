import React from "react";
import styled, { useTheme } from "styled-components";
import Link from "next/link";
import { useRouter } from "next/router";

import { useIsMobile } from "../lib/hooks/useWindowSize";
import { WalletStatus } from "./wallet-status";

const Container = styled.div`
    padding: 30px 0 30px;
    font-size: 13px;
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: space-between;
`;

const Section = styled.div`
    display: flex;
    flex-wrap: wrap;
    padding: 40px 40px 0;
    color: ${({ color }) => color};
`;

const ClickableText = styled.a`
    text-decoration: underline;
    color: ${({ theme }) => theme.lightText};
`;

const MobileFooter = styled.div`
    margin-top: 10px;
    background-color: ${({ theme }) => theme.clear};
    box-sizing: border-box;
    width: 100%;
    padding: 16px;
    min-height: 90px;
    bottom: 0;
    position: sticky;
`;

// @TODO: Maybe we should share this const with the header
const FOOTER_LINKERS = [
    {
        url: "https://discord.gg/sQCxgYs",
        name: "Discord",
    },
    {
        url: "https://twitter.com/vocdoni",
        name: "Twitter",
    },
    {
        url: "https://t.me/vocdoni",
        name: "Telegram",
    },
];

export const Footer = () => {
    const theme = useTheme();
    const isMobile = useIsMobile();

    return isMobile ? (
        <MobileFooter>
            <WalletStatus />
        </MobileFooter>
    ) : (
        <Container>
            <Section>
                {FOOTER_LINKERS.map(({ url, name }, i) => (
                    <div key={name}>
                        <Link href={url} passHref>
                            <ClickableText target="_blank">
                                {name}
                            </ClickableText>
                        </Link>
                        {i < FOOTER_LINKERS.length - 1 ? " · " : null}
                    </div>
                ))}
            </Section>
            <Section color={theme.lightText}>
                Vocdoni {new Date().getFullYear()}
            </Section>
        </Container>
    );
};
