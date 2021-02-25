import styled from "styled-components";

const Container = styled.div`
    padding: 30px 0 30px;
    font-size: 13px;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
`;

const ExternalLink = styled.a`
    color: var(--light-text-);
`;

const Section = styled.div`
    padding: 40px var(--horizontal-margin) 0;
    color: var(--light-text);
`;

// @TODO: Maybe we should share this const with the header
const FOOTER_LINKERS = [
    {
        url: "https://discord.gg/sQCxgYs",
        name: "Discord",
    },
    {
        url: "https://twitter.com/vocdoni",
        name: "Twitter",
    },
    {
        url: "https://t.me/vocdoni",
        name: "Telegram",
    },
];

export const Footer = () => (
    <Container>
        <Section>
            {FOOTER_LINKERS.map(({ url, name }, i) => (
                <>
                    <ExternalLink href={url}>{name}</ExternalLink>
                    {i < FOOTER_LINKERS.length - 1 ? " · " : null}
                </>
            ))}
        </Section>
        <Section>Vocdoni {new Date().getFullYear()}</Section>
    </Container>
);
