import React from "react";
import styled, { CSSProperties } from "styled-components";

export type ExternalLinkStyle = Pick<
    CSSProperties,
    "fontWeight" | "color" | "textDecoration"
>;

interface ExternalLinkProps extends ExternalLinkStyle {
    link: string;
    children: React.ReactNode;
    dontRedirect?: boolean;
}

const Link = styled.a`
    text-decoration: ${({ textDecoration }) => textDecoration || "none"};
    font-weight: ${({ fontWeight }: CSSProperties) => fontWeight};
    color: ${({ theme, color }) => color || theme.lightText};
`;

export const ExternalLink = ({
    link,
    children,
    dontRedirect,
    ...props
}: ExternalLinkProps): JSX.Element => (
    <Link
        href={link}
        rel="noreferrer noopener"
        target={dontRedirect ? "_self" : "_blank"}
        {...props}
    >
        {children}
    </Link>
);
