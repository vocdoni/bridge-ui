import React, { useState } from "react";
import styled from "styled-components";
import Link from "next/link";
import Hamburger from "hamburger-react";
import { useIsMobile } from "../lib/hooks/useWindowSize";

const HeaderContainer = styled.p`
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

const BetaLabel = styled.label`
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    padding: 1px 8px 2px;

    width: 43px;
    height: 19px;
    left: calc(50% - 43px / 2 - 549.5px);
    top: calc(50% - 19px / 2 - 750px);

    background: linear-gradient(97.3deg, #01c3ff 13.16%, #01e6f8 90.26%);
    border-radius: 40px;
    color: white;
    margin-left: 10px;
`;

const ListContainer = styled.div`
    padding: ${({ theme }) => "0 " + theme.margins.desktop.horizontal};
    display: flex;
    width: 100%;
    justify-content: space-between;
    align-items: center;

    @media ${({ theme }) => theme.screens.tablet} {
        padding: 0 20px;
    }
`;

const MenuItemsContainer = styled.div`
    display: flex;
    justify-content: center;

    @media ${({ theme }) => theme.screens.tablet} {
        margin-top: 10px;
    }
`;

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

        &:first-child {
            margin-top: 10px;
        }

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
    color: ${({ theme }) => theme.white};
    text-decoration: none;
    cursor: pointer;
`;

const ClickableLink = styled.a`
    text-decoration: none;
    color: ${({ theme }) => theme.white};
`;

const MobileMenuContainer = styled.div<{ showMenu: boolean }>`
    position: fixed;
    padding: 0;
    margin: 0;
    top: -100%;
    left: 0;
    width: 100%;
    height: 100%;
    background: ${({ theme }) => theme.white};
    z-index: 10;
    margin-top: 70px;

    -webkit-transition: top 0.5s ease-in-out;
    -moz-transition: top 0.5s ease-in-out;
    -o-transition: top 0.5s ease-in-out;
    transition: top 0.5s ease-in-out;

    @media ${({ theme }) => theme.screens.tablet} {
        top: ${({ showMenu }) => (showMenu ? "0" : "-100%")};
    }
`;

const Section = styled.div`
    display: flex;
    margin-top: 30px;
    justify-content: center;
    color: ${({ color }) => color};
`;

interface LinkProps {
    name: string;
    url: string;
    external?: boolean;
    header?: boolean;
    footer?: boolean;
}

export const LINKS: LinkProps[] = [
    {
        url: "/tokens",
        name: "Find Tokens",
        header: true,
    },
    {
        url: "https://docs.vocdoni.io",
        name: "Docs",
        external: true,
        header: true,
    },
    {
        url: "https://discord.gg/sQCxgYs",
        name: "Discord",
        external: true,
        header: true,
        footer: true,
    },
    {
        url: "https://twitter.com/vocdoni",
        name: "Twitter",
        external: true,
        footer: true,
    },
    {
        url: "https://t.me/vocdoni",
        name: "Telegram",
        external: true,
        footer: true,
    },
];

const LinkItem = ({
    name,
    url,
    external,
    onClick,
}: LinkProps & React.HTMLProps<HTMLAnchorElement>) => (
    <ListItem>
        <Link href={url} passHref>
            <ClickableLink
                onClick={onClick}
                target={external ? "_blank" : "_self"}
            >
                {name}
            </ClickableLink>
        </Link>
    </ListItem>
);

export const Header = () => {
    const [showMenu, setShowMenu] = useState(false);
    const isMobile = useIsMobile();
    const HEADER_LINKS = LINKS.filter((l) => l.header);

    return (
        <>
            {isMobile && (
                <MobileMenuContainer showMenu={showMenu}>
                    {LINKS.map((link) => (
                        <LinkItem
                            {...link}
                            key={link.name}
                            onClick={() => setShowMenu(false)}
                        />
                    ))}
                    <Section>Vocdoni {new Date().getFullYear()}</Section>
                </MobileMenuContainer>
            )}
            <HeaderContainer>
                <ListContainer>
                    <div style={{ display: "flex", alignItems: "baseline" }}>
                        <Link href="/" passHref>
                            <VocdoniLink target="_self">
                                Vocdoni Bridge
                            </VocdoniLink>
                        </Link>
                        <BetaLabel>Beta</BetaLabel>
                    </div>
                    <MenuItemsContainer>
                        {!isMobile &&
                            HEADER_LINKS.map((link) => (
                                <LinkItem {...link} key={link.name} />
                            ))}
                    </MenuItemsContainer>
                    {isMobile && (
                        <Hamburger
                            toggled={showMenu}
                            toggle={setShowMenu}
                            color="#fff"
                            size={25}
                        />
                    )}
                </ListContainer>
            </HeaderContainer>
        </>
    );
};
