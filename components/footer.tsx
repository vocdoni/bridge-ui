import React from "react";
import styled, { useTheme } from "styled-components";
import Link from "next/link";

import { LINKS } from "./header";
import { ConnectButton } from "./connect-button";
import { useIsMobile } from "../lib/hooks/useWindowSize";
import { FOOTER_LOGO } from "../lib/constants";

const Container = styled.div`  

  height: 71px;
  font-size: 16px;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: space-between;
  background: ${({ theme }) => theme.blackAndWhite.w1}CC;
`;

const Logo = styled.div`
  background: url(${FOOTER_LOGO});
  position: absolute;
  display: flex;
  width: 155px;
  margin-top: 15px;
  height: 40px;
  left: 176px;
`;

const Section = styled.div`
  display: flex;
  flex-wrap: wrap;
  padding: 0px 40px 0;
  color: ${({ color }) => color};
`;

const ClickableText = styled.a`
  padding: ${({ theme }) => "25px " + theme.margins.desktop.horizontal};
  display: flex;
  width: 100%;
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
  const theme = useTheme();
  const isMobile = useIsMobile();

  const FOOTER_LINKS = LINKS.filter((l) => l.footer);

  return isMobile ? (
    <MobileFooter>
      <ConnectButton />
    </MobileFooter>
  ) : (
    <Container>
      <Section>
        <Logo></Logo>
      </Section>
      <Section>
        {FOOTER_LINKS.map(({ url, name }, i) => (
            <div key={name}>
              <Link href={url} passHref>
                <ClickableText target="_blank">{name}</ClickableText>
              </Link>
            </div>
          ))}
      </Section>
    </Container>
  );
};
