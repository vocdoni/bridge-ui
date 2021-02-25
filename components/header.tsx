import styled from "styled-components";

const HeaderContainer = styled.div`
    -index: 100;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;

    padding: 10px 0 10px;
    background: linear-gradient(
        90deg,
        var(--accent-1) 0%,
        var(--accent-2) 100%
    );
    color: var(--clear);
    font-size: 16px;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
`;

const LinkStyle = `
    color: var(--clear);
    text-decoration: none;
`;

const ListContainer = styled.ul`
    padding: 0 var(--horizontal-margin) 0;
    display: inline;
    list-style: none;
`;

const ListItem = styled.li`
    display: inline;
    margin-right: 20px;
    &:last-child {
        margin-right: 0;
    }
`;

const TitleLink = styled.a`
    ${LinkStyle}
    font-weight: 500;
`;

const ExternalLink = styled.a`
    ${LinkStyle}
`;

interface LinkProps {
    name: string;
    url: string;
}

const HEADERS_LINKS: LinkProps[] = [
    {
        url: "/tokens",
        name: "Find Tokens",
    },
    {
        url: "https://blog.vocdoni.io",
        name: "Blog",
    },
    {
        url: "https://docs.vocdoni.io",
        name: "Docs",
    },
    {
        url: "https://discord.gg/sQCxgYs",
        name: "Discord",
    },
];

const Link = ({ name, url }: LinkProps) => (
    <ListItem>
        <ExternalLink href={url}>{name}</ExternalLink>
    </ListItem>
);

export const Header = () => (
    <HeaderContainer>
        <ListContainer>
            <ListItem>
                <TitleLink rel="noopener noreferrer" href="/">
                    Vocdoni Bridge
                </TitleLink>
            </ListItem>
        </ListContainer>
        <ListContainer>
            {HEADERS_LINKS.map((link) => (
                <Link {...link} />
            ))}
        </ListContainer>
    </HeaderContainer>
);
