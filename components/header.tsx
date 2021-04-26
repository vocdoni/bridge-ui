import React, { useState } from "react";
import styled from "styled-components";
import Link from "next/link";
import Hamburger from "hamburger-react";
import { useIsMobile } from "../lib/hooks/useWindowSize";
import { ConnectionRejectedError } from "use-wallet";

const HeaderContainer = styled.div`
  width: 100%;
  z-index: 100;
  min-height: 50px;
  position: fixed;
  top: 0;
  padding: 10px 0 10px;
  background-color: ${({ theme }) => theme.blackAndWhite.w1};

  font-size: 16px;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  background: ${({ theme }) => theme.blackAndWhite.w1};
`;

const Logo = styled.div`
  background: url('media/LOGO01.svg');
  position: asbsolute;
  width: 57px;
  height: 57px;
  left: 40px;
  top: 7px;
`;

const ConnectAccount = styled.label`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  padding: 11px 20px 12px;
  width: 173px;
  height: 45px;
  left: calc(50% - 173px/2 + 673.5px);
  top: calc(50% - 45px/2 - 749px);
  color: ${({ theme }) => theme.blackAndWhite.w1};
  font-weight: 600;
  font-size: 18px;
  background: ${({ theme }) =>
    `linear-gradient(${theme.gradients.primary.mg1.a}, ${theme.gradients.primary.mg1.c1}, ${theme.gradients.primary.mg1.c2});`};

  box-shadow: 0px 3px 3px rgba(180, 193, 228, 0.35);
  border-radius: 8px;
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

  font-family: Manrope;
  font-size: 12px;
  font-weight: 600;

  border-radius: 40px;
  color: white;
  margin-top: 22px;
  margin-left: 10px;
  background: ${({ theme }) =>
    `linear-gradient(${theme.gradients.primary.mg1.a}, ${theme.gradients.primary.mg1.c1}, ${theme.gradients.primary.mg1.c2});`};
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

const TextOne = styled.span`
  margin-top: 22px;
  font-family: Manrope;
  font-weight: 500;
  font-size: 18px;
  line-height: 25px;
  align-items: center;
  text-decoration: none;
  color: ${({ theme }) => theme.grayScale.g5};
`;

const TextTwo = styled.span`
  margin-top: 22px;
  margin-left: 3px;
  font-family: Manrope;
  font-weight: 500;
  font-size: 18px;
  line-height: 25px;
  align-items: center;
  text-decoration: none;
  color: ${({ theme }) => theme.blackAndWhite.b1};
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
      color: ${({ theme }) => theme.blackAndWhite.b1};
      font-size: 20px;
      font-weight: 500;

      &:hover {
        color: ${({ theme }) => theme.blackAndWhite.b1};
      }
    }
  }
`;

const VocdoniLink = styled.a`
  position: absolute;
  width: 665px;
  height: 24px;
  left: 111px;
  top: 22px;
  font-family: Manrope;
  font-style: normal;
  font-weight: normal;
  font-size: 18px;
  line-height: 25px;
  display: flex;
  align-items: center;
  text-decoration: none;
  color: ${({ theme }) => theme.blackAndWhite.b1};
`;

const ClickableLink = styled.a`
  display: flex;
  padding: 25px 0px;
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
    url: "https://discord.gg/sQCxgYs",
    name: "Discord",
    external: true,
    header: false,
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
            <Logo></Logo>
            <Link href="/" passHref>
              <VocdoniLink target="_self"><TextOne>Aragon</TextOne><TextTwo>Voice</TextTwo><BetaLabel>Beta</BetaLabel></VocdoniLink>
            </Link>
            
          </LinkContainer>
          <MenuItemsContainer>
            {!isMobile && HEADER_LINKS.map((link) => <LinkItem {...link} key={link.name} />)}
            <ConnectAccount>Connect account</ConnectAccount>
          </MenuItemsContainer>
          {isMobile && <Hamburger toggled={showMenu} toggle={setShowMenu} color="#fff" size={25} />}
        </ListContainer>
      </HeaderContainer>
    </>
  );
};
