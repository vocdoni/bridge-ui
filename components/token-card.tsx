import styled, { useTheme } from "styled-components";
import { ExternalLink } from "./external-link";

type Props = {
    key?: any;
    children: any;
    name: string;
    icon: string;
    rightText?: string;
    href: string;
    onClick?: () => any;
};

const Container = styled.div`
    background: white;
    cursor: pointer;

    flex: 1 0 500px;
    box-sizing: border-box;
    margin: 1rem 1em 1rem;

    background: linear-gradient(
        101.6deg,
        var(--accent-1) 0%,
        var(--accent-2) 100%
    );
    border-radius: 13px;
    box-shadow: 1px 4px 9px rgba(0, 0, 0, 0.2);
    transition: box-shadow 0.1s ease-in-out;
    opacity: 1;

    &:hover {
        box-shadow: 1px 4px 9px rgba(0, 0, 0, 0.35);
        opacity: 0.95;
    }

    // This will change with responsive
    max-width: calc(33.3333333% - 2em);
`;

const Card = styled.div`
    padding: 1.4em;
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

export default function TokenCard({ children, ...props }: Props) {
    const theme = useTheme();
    return (
        <Container>
            <ExternalLink dontRedirect color={theme.clear} link={props.href}>
                <Card>
                    <TokenLogo src={props.icon} />
                    {props.rightText && (
                        <RightText>{props.rightText}</RightText>
                    )}
                    <Text className="text">
                        <Name>{props.name}</Name>
                        {children}
                    </Text>
                </Card>
            </ExternalLink>
        </Container>
    );
}
