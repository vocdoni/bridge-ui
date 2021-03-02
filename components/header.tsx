import React from "react";
import styled, { useTheme } from "styled-components";
import Link from "next/link";

const HeaderContainer = styled.div`
    width: 100%;
    z-index: 100;
    position: fixed;
    top: 0;
    padding: 10px 0 10px;
    background: linear-gradient(
        90deg,
        ${({ theme }) => theme.accent1} 0%,
        ${({ theme }) => theme.accent2} 100%
    );

    font-size: 16px;
    display: flex;
    flex-direction: row;
    justify-content: space-between;

    @media (max-width: ${({ theme }) => theme.screens.tablet}px) {
        color: red;
    }
`;

const ListContainer = styled.ul`
    padding: ${({ theme }) => "0 " + theme.margins.horizontal};
    display: inline;
    list-style: none;
`;

const ListItem = styled.li`
    display: inline;
    margin-right: 20px;
    &:last-child {
        margin-right: 0;
    }
`;

const VocdoniLink = styled.a`
    font-weight: 500;
    color: ${({ theme }) => theme.clear};
    text-decoration: none;
`;

const ClickableLink = styled.a`
    text-decoration: none;
    color: ${({ theme }) => theme.clear};
`;

interface LinkProps {
    name: string;
    url: string;
    external?: boolean;
}

const HEADERS_LINKS: LinkProps[] = [
    {
        url: "/tokens",
        name: "Find Tokens",
    },
    {
        url: "https://blog.vocdoni.io",
        name: "Blog",
        external: true,
    },
    {
        url: "https://docs.vocdoni.io",
        name: "Docs",
        external: true,
    },
    {
        url: "https://discord.gg/sQCxgYs",
        name: "Discord",
        external: true,
    },
];

const LinkItem = ({ name, url, external }: LinkProps) => (
    <ListItem>
        <Link href={url} passHref>
            <ClickableLink target={external ? "_blank" : "_self"}>
                {name}
            </ClickableLink>
        </Link>
    </ListItem>
);

export const Header = () => {
    const theme = useTheme();
    return (
        <HeaderContainer>
            <ListContainer>
                <ListItem>
                    <Link href="/" passHref>
                        <VocdoniLink>Vocdoni Bridge</VocdoniLink>
                    </Link>
                </ListItem>
            </ListContainer>
            <ListContainer>
                {HEADERS_LINKS.map((link) => (
                    <LinkItem {...link} key={link.name} />
                ))}
            </ListContainer>
        </HeaderContainer>
    );
};
