import React from "react";
import styled from "styled-components";
import { WalletStatus } from "./wallet-status";

const Head = styled.div`
    display: flex;
    flex-wrap: wrap;
`;

const LeftSection = styled.div`
    width: 70%;
    @media ${({ theme }) => theme.screens.tablet} {
        width: 100%;
    }
`;

const RightSection = styled.div`
    width: 30%;
    margin-top: 3em;

    @media ${({ theme }) => theme.screens.tablet} {
        width: 100%;
        margin-left: 0;
    }
`;

const Title = styled.h1`
    margin-bottom: 5px;
`;

const Subtitle = styled.h4`
    margin-top: 5px;
    font-size: 20px;
    color: ${({ theme }) => theme.accent1};
`;

interface TopSectionProps {
    title: string;
    description: string;
    Action?: () => JSX.Element;
}

export const TopSection = ({ title, description, Action }: TopSectionProps) => {
    return (
        <Head>
            <LeftSection>
                <Title>{title}</Title>
                <Subtitle>{description}</Subtitle>
            </LeftSection>
            <RightSection>
                <WalletStatus />
                {Action ? <Action /> : null}
            </RightSection>
        </Head>
    );
};
