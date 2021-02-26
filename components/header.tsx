import React from "react";
import styled, { useTheme } from "styled-components";
import { ExternalLink, ExternalLinkStyle } from "./external-link";

const HeaderContainer = styled.div`
    -index: 100;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;

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

interface LinkProps extends ExternalLinkStyle {
    name: string;
    url: string;
    dontRedirect?: boolean;
}

const HEADERS_LINKS: LinkProps[] = [
    {
        url: "/tokens",
        name: "Find Tokens",
        dontRedirect: true,
    },
    {
        url: "https://blog.vocdoni.io",
        name: "Blog",
    },
    {
        url: "https://docs.vocdoni.io",
        name: "Docs",
    },
    {
        url: "https://discord.gg/sQCxgYs",
        name: "Discord",
    },
];

const Link = ({ name, url, ...props }: LinkProps) => (
    <ListItem>
        <ExternalLink {...props} link={url}>
            {name}
        </ExternalLink>
    </ListItem>
);

export const Header = () => {
    const theme = useTheme();
    return (
        <HeaderContainer>
            <ListContainer>
                <ListItem>
                    <ExternalLink
                        dontRedirect
                        fontWeight={500}
                        color={theme.clear}
                        link="/"
                    >
                        Vocdoni Bridge
                    </ExternalLink>
                </ListItem>
            </ListContainer>
            <ListContainer>
                {HEADERS_LINKS.map((link) => (
                    <Link {...link} color={theme.clear} />
                ))}
            </ListContainer>
        </HeaderContainer>
    );
};
