import styled from "styled-components";

import { Header } from "./header";
import { Footer } from "./footer";
import { MessageAlert } from "./msg-alert";
import { LoadingAlert } from "./loading-alert";

const LayoutContainer = styled.div`
    padding-top: 71px;

    & > * {
        max-width: 992px;
        margin-left: auto;
        margin-right: auto;
        padding: 0 ${({ theme }) => theme.margins.horizontal};
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
