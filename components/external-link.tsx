import React from "react";
import styled, { CSSProperties } from "styled-components";

export type ExternalLinkStyle = Pick<
    CSSProperties,
    "fontWeight" | "color" | "textDecoration"
>;

interface ExternalLinkProps extends ExternalLinkStyle {
    link: string;
    children: React.ReactNode;
}

const Link = styled.a`
    text-decoration: ${({ textDecoration }) => textDecoration || "none"};
    font-weight: ${({ fontWeight }: CSSProperties) => fontWeight};
    color: ${({ theme, color }) => color || theme.lightText};
`;

export const ExternalLink = ({
    link,
    children,
    ...props
}: ExternalLinkProps): JSX.Element => (
    <Link href={link} rel="noreferrer noopener" target="_blank" {...props}>
        {children}
    </Link>
);
