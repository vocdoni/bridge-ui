import React from "react";
import styled, { useTheme } from "styled-components";
import Link from "next/link";

const Container = styled.div`
    padding: 30px 0 30px;
    font-size: 13px;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
`;

const Section = styled.div`
    padding: 40px 40px 0;
    color: ${({ color }) => color};
`;

const ClickableText = styled.a`
    text-decoration: underline;
    color: ${({ theme }) => theme.lightText};
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
    return (
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
