import React from "react";
import styled from "styled-components";
import { WalletStatus } from "./wallet-status";

const Head = styled.div`
    display: flex;
`;

const LeftSection = styled.div`
    width: 70%;
`;

const RightSection = styled.div`
    width: 30%;
    margin-left: 2em;
    margin-top: 3em;
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
