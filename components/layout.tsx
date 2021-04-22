import React from "react";
import styled from "styled-components";

import { Header } from "./header";
import { Footer } from "./footer";
import { MessageAlert } from "./msg-alert";
import { LoadingAlert } from "./loading-alert";
import { size } from "../theme";

const LayoutContainer = styled.div`
  padding: 0 ${({ theme }) => theme.margins.desktop.horizontal};
  margin-top: 77px;
  max-width: 1600px;
  margin-left: auto;
  margin-right: auto;
  border: solid;
  
  @media ${size.tablet} {
    margin-bottom: 110px;
    margin-top: 50px;
    padding: 0 ${({ theme }) => theme.margins.mobile.horizontal};
  }
`;

export const Layout = ({ children }) => (
  <>
    <MessageAlert />
    <LoadingAlert />
    <Header />
    <LayoutContainer>{children}</LayoutContainer>
    <Footer />
  </>
);
