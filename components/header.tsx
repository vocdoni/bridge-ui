import React, { useState } from "react";
import styled from "styled-components";
import Link from "next/link";
import Hamburger from "hamburger-react";
import { useIsMobile } from "../lib/hooks/useWindowSize";
import { HEADER_LOGO } from "../lib/constants";
import { ConnectButton } from "./connect-button";

const HeaderContainer = styled.div`
  width: 100%;
  height: 71px;
  position: fixed;
  top: 0;
  display: flex;
  justify-content: center;
  align-items: center;

  background: ${({ theme }) => theme.blackAndWhite.w1}99;
`;

const Logo = styled.div`
  background: url(${HEADER_LOGO});
  position: asbsolute;
  width: 148px;
  height: 57px;
  margin-left: 40px;
  margin-top: 7px;
  margin-right: 19px;
`;

const BetaLabel = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;

  width: 43px;
  height: 19px;
  left: calc(50% - 43px / 2 - 549.5px);
  top: calc(50% - 19px / 2 - 750px);

  font-family: Manrope;
  font-size: 12px;
  font-weight: 600;

  border-radius: 40px;
  color: white;
  margin-top: 5px;
  margin-left: 10px;
  background: ${({ theme }) =>
    `linear-gradient(${theme.gradients.primary.mg1.a}, ${theme.gradients.primary.mg1.c1}, ${theme.gradients.primary.mg1.c2});`};
`;

const ListContainer = styled.div`
  display: flex;
  width: 1440px;
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
      color: ${({ theme }) => theme.blackAndWhite.b1};
      font-size: 20px;
      font-weight: 500;

      &:hover {
        color: ${({ theme }) => theme.blackAndWhite.b1};
      }
    }
  }
`;

const VoiceLink = styled.a`
  height: 50px;
  font-size: 18px;
  display: flex;
  align-items: center;
  text-decoration: none;
  cursor: pointer;
`;

const ClickableLink = styled.a`
  display: flex;
  padding: ${({ theme }) => "25px " + theme.margins.desktop.horizontal};
  text-decoration: none;
  font-size: 18px;
  font-weight: 500;
  color: ${({ theme }) => theme.blackAndWhite.b1};
  &:hover {
    color: ${({ theme }) => theme.primary.p1};
    );
`;

const MobileMenuContainer = styled.div<{ showMenu: boolean }>`
  position: fixed;
  padding: 0;
  margin: 0;
  top: -100%;
  left: 0;
  width: 100%;
  height: 100%;
  background: ${({ theme }) => theme.blackAndWhite.w1};
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

const LinkContainer = styled.div`
  display: flex;
  align-items: baseline;
  cursor: pointer;
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
    url: "/",
    name: "Home",
    external: false,
    header: true,
  },
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
    url: "https://discordapp.com/invite/eqQJkdp",
    name: "Discord",
    external: true,
    header: false,
    footer: true,
  },
  {
    url: "https://twitter.com/AragonProject",
    name: "Twitter",
    external: true,
    footer: true,
  },
  {
    url: "https://t.me/AragonProject",
    name: "Telegram",
    external: true,
    footer: true,
  },
  {
    url: "https://forum.aragon.org/",
    name: "Forum",
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
      <ClickableLink onClick={onClick} target={external ? "_blank" : "_self"}>
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
            <LinkItem {...link} key={link.name} onClick={() => setShowMenu(false)} />
          ))}
          <Section>Vocdoni {new Date().getFullYear()}</Section>
        </MobileMenuContainer>
      )}
      <HeaderContainer>
        <ListContainer>
          <LinkContainer>
            <Link href="/" passHref>
              <VoiceLink target="_self">
                <Logo />
                <BetaLabel>Beta</BetaLabel>
              </VoiceLink>
            </Link>
          </LinkContainer>
          <MenuItemsContainer>
            {!isMobile && HEADER_LINKS.map((link) => <LinkItem {...link} key={link.name} />)}
            <ConnectButton></ConnectButton>
          </MenuItemsContainer>
          {isMobile && <Hamburger toggled={showMenu} toggle={setShowMenu} color="#fff" size={25} />}
        </ListContainer>
      </HeaderContainer>
    </>
  );
};
