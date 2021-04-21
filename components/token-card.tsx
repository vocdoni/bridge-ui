import React from "react";
import styled from "styled-components";
import Link from "next/link";

const Container = styled.div`
    background: white;
    cursor: pointer;

    flex: 1 0 500px;
    box-sizing: border-box;
    margin: 1rem 1em;

    background: linear-gradient(
        101.6deg,
        ${({ theme }) => theme.accent1} 0%,
        ${({ theme }) => theme.accent2} 100%
    );
    border-radius: 13px;
    box-shadow: 1px 4px 9px rgba(0, 0, 0, 0.2);
    transition: box-shadow 0.1s ease-in-out;
    opacity: 1;

    &:hover {
        box-shadow: 1px 4px 9px rgba(0, 0, 0, 0.35);
        opacity: 0.95;
    }

    max-width: calc(33.3333333% - 2em);
    min-width: 250px;

    @media ${({ theme }) => theme.screens.tablet} {
        margin: 10px;
        max-width: calc(50% - 2em);
        text-align: start;
        justify-content: center;
    }
    @media ${({ theme }) => theme.screens.mobileL} {
        max-width: calc(100% - 2em);
    }
`;

const Card = styled.div`
    padding: 1.4em;
    color: ${({ theme }) => theme.white};
`;

const TokenLogo = styled.img`
    position: absolute;
    width: 40px;
    height: 40px;
    margin-right: 20px;
`;

const Text = styled.div`
    padding-left: 60px;
`;

const Name = styled.h3`
    font-weight: 500;
    font-size: 28px;
    margin-top: 0;
    margin-bottom: 0.5em;
`;

const RightText = styled.span`
    float: right;
`;

type CardProps = {
    key?: string | number;
    children: React.ReactNode;
    name: string;
    icon: string;
    rightText?: string;
    href: string;
    onClick?: () => void;
};

// eslint-disable-next-line react/display-name
const ClickableCard = React.forwardRef<HTMLDivElement, CardProps>(
    ({ onClick, icon, rightText, name, children }, ref) => {
        return (
            <Card onClick={onClick} ref={ref}>
                <TokenLogo src={icon} />
                {rightText && <RightText>{rightText}</RightText>}
                <Text>
                    <Name>{name}</Name>
                    {children}
                </Text>
            </Card>
        );
    }
);

const TokenCard = ({ children, ...props }: CardProps) => (
    <Container>
        <Link href={props.href}>
            <ClickableCard {...props}>{children}</ClickableCard>
        </Link>
    </Container>
);

export default TokenCard;
