import React from "react";
import styled from "styled-components";
import Link from "next/link";

import { LINKS } from "./header";
import { ConnectButton } from "./connect-button";
import { useIsMobile } from "../lib/hooks/useWindowSize";
import { FOOTER_LOGO } from "../lib/constants";

const Container = styled.div`
  bottom: 0;
  width: 100%;
  height: 71px;
  display: flex;
  justify-content: center;
  background: ${({ theme }) => theme.blackAndWhite.w1}CC;
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

const Logo = styled.div`
  background: url(${FOOTER_LOGO});
  position: flex;
  display: flex;
  width: 155px;
  margin-top: 5px;
  margin-left: 50px;
  height: 40px;
`;

const Section = styled.div`
  display: flex;
  flex-wrap: wrap;
  padding: 0px 40px 0;
  color: ${({ color }) => color};
`;

const ClickableText = styled.a`
  margin-right: 80px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  text-decoration: none;
  font-size: 18px;
  font-weight: 500;
  color: ${({ theme }) => theme.blackAndWhite.b1};
  &:hover {
    color: ${({ theme }) => theme.primary.p1};
    );
`;

const MobileFooter = styled.div`
  background-color: ${({ theme }) => theme.blackAndWhite.w1};
  box-sizing: border-box;
  width: 100%;
  padding: 16px;
  min-height: 100px;
  left: 0;
  right: 0;
  bottom: 0;
  position: fixed;
`;

export const Footer = () => {
  const isMobile = useIsMobile();

  const FOOTER_LINKS = LINKS.filter((l) => l.footer);

  return isMobile ? (
    <MobileFooter>
      <ConnectButton />
    </MobileFooter>
  ) : (
    <Container>
      <ListContainer>
        <Section>
          <Logo></Logo>
        </Section>
        <Section>
          {FOOTER_LINKS.map(({ url, name }) => (
            <div key={name}>
              <Link href={url} passHref>
                <ClickableText target="_blank">{name}</ClickableText>
              </Link>
            </div>
          ))}
        </Section>
      </ListContainer>
    </Container>
  );
};
