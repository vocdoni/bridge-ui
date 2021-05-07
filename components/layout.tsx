import React from "react";
import styled from "styled-components";

import { Header } from "./header";
import { Footer } from "./footer";
import { MessageAlert } from "./msg-alert";
import { LoadingAlert } from "./loading-alert";

const MainContent = styled.div`
  flex: 1;
  margin-top: 100px;
  margin-bottom: 50px;
  box-sizing: border-box;
  padding: 0 11%;

  @media ${({ theme }) => theme.screens.tablet} {
    margin-bottom: 110px;
    margin-top: 50px;
    box-sizing: border-box;
    padding: 0 ${({ theme }) => theme.margins.mobile.horizontal};
  }
`;

const Wrapper = styled.div`
  display: flex;
  min-height: 100vh;
  flex-direction: column;
`;

export const Layout = ({ children }) => (
  <Wrapper>
    <MessageAlert />
    <LoadingAlert />
    <Header />
    <MainContent>{children}</MainContent>
    <Footer />
  </Wrapper>
);
