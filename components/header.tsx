import React, { useMemo, useState } from "react";
import styled, { useTheme } from "styled-components";
import Link from "next/link";
import Hamburger from 'hamburger-react'
import { useWindowSize } from "../lib/hooks/useWindowSize";
import { size } from "../theme";

const HeaderContainer = styled.div`
    width: 100%;
    z-index: 100;
    min-height: 50px;
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
    align-items: center;
    flex-wrap: wrap;
`;

const ListContainer = styled.div`
    padding: ${({ theme }) => "0 " + theme.margins.desktop.horizontal};
    display: flex;
    width: 100%;
    justify-content: space-between;
    align-items: center;
`;

const MenuItemsContainer = styled.div`
    display: flex;
    justify-content: center;
`

const ListItem = styled.div`
    margin-right: 20px;
    &:last-child {
        margin-right: 0;
    }

    @media ${({ theme }) => theme.screens.tablet} {
        cursor: pointer;
        width: 100%;
        display: flex;
        flex-direction: row;
        justify-content: center;
        align-items: center;
        min-height: 50px;

        & > a {
            color: ${({ theme }) => theme.mainText};
            font-size: 20px;
            font-weight: 500;

            &:hover {
                color: ${({ theme }) => theme.accent1};
            }
        }
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
    mobile?: boolean;
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

const LinkItem = ({ name, url, external, mobile }: LinkProps) => (
    <ListItem>
        <Link href={url} passHref>
            <ClickableLink target={external ? "_blank" : "_self"}>
                {name}
            </ClickableLink>
        </Link>
    </ListItem>
);

const MobileMenuContainer = styled.div`
    position:fixed;
    padding:0;
    margin:0;
    top:-100%;
    left:0;
    width: 100%;
    height: 100%;
    background: ${({ theme }) => theme.clear};
    z-index: 10;
    margin-top: 70px;

    -webkit-transition: top 0.5s ease-in-out;
    -moz-transition: top 0.5s ease-in-out;
    -o-transition: top 0.5s ease-in-out;
    transition: top 0.5s ease-in-out;

    @media ${({ theme }) => theme.screens.tablet} {
        top: ${({ showMenu }: { showMenu: boolean }) => showMenu? "0": "-100%"};
    }
`

export const Header = () => {
    const [showMenu, setShowMenu] = useState(false);
    const { width } = useWindowSize()
    const isMobile = useMemo(() => width <= size.tablet, [width])

    return (
        <>
            {isMobile && 
            <MobileMenuContainer showMenu={showMenu}>
                {HEADERS_LINKS.map((link) => (
                    <LinkItem {...link} mobile={true} key={link.name}/>
                ))}
            </MobileMenuContainer>}
            <HeaderContainer>
                <ListContainer>
                    <Link href="/" passHref>
                        <VocdoniLink>Vocdoni Bridge</VocdoniLink>
                    </Link>
                    <MenuItemsContainer>
                        {!isMobile && HEADERS_LINKS.map((link) => (
                            <LinkItem {...link} key={link.name} />
                        ))}
                    </MenuItemsContainer>
                    {isMobile && <Hamburger toggled={showMenu} toggle={setShowMenu} color="#fff" />}
                </ListContainer>
            </HeaderContainer>
        </>
    );
};
