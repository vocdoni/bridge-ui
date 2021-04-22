import React from "react";
import styled, { useTheme } from "styled-components";
import Link from "next/link";

import { LINKS } from "./header";
import { ConnectButton } from "./connect-button";
import { useIsMobile } from "../lib/hooks/useWindowSize";

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
  background-color: ${({ theme }) => theme.white};
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
        {FOOTER_LINKS.map(({ url, name }, i) => (
          <div key={name}>
            <Link href={url} passHref>
              <ClickableText target="_blank">{name}</ClickableText>
            </Link>
            {i < FOOTER_LINKS.length - 1 ? " · " : null}
          </div>
        ))}
      </Section>
      <Section color={theme.lightText}>Vocdoni {new Date().getFullYear()}</Section>
    </Container>
  );
};
