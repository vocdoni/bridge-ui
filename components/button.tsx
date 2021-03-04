import Link from "next/link";
import React from "react";
import styled from "styled-components";

const StyledButton = styled.div`
    box-sizing: border-box;
    border-radius: 40px;
    padding: 15px;
    cursor: pointer;
    text-align: center;
    font-size: 16px;
    letter-spacing: 0.01em;

    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
`;

type ButtonProps = {
    children: React.ReactNode;
    href?: string;
    onClick?: () => void;
};

function Button({ children, onClick, href }: ButtonProps) {
    if (onClick)
        return <StyledButton onClick={onClick}>{children}</StyledButton>;

    return (
        <Link href={href}>
            <StyledButton>{children}</StyledButton>
        </Link>
    );
}

Button.Styled = StyledButton;
export default Button;
