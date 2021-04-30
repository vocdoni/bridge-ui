import Link from "next/link";
import React from "react";
import styled, { css } from "styled-components";

interface ButtonProps {
  disabled?: boolean;
  children?: React.ReactNode;
  href?: string;
  onClick?: () => void;
}

const StyledButton = styled.button<{ disabled?: boolean }>`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  width: 173px;
  height: 45px;
  left: calc(50% - 173px / 2 + 673.5px);
  top: calc(50% - 45px / 2 - 749px);
  margin-right: 60px;
  color: ${({ theme }) => theme.blackAndWhite.w1};
  font-weight: 600;
  font-size: 16px;
  background: ${({ theme }) =>
    `linear-gradient(${theme.gradients.primary.mg1.a}, ${theme.gradients.primary.mg1.c1}, ${theme.gradients.primary.mg1.c2});`};

  box-shadow: ${({ theme }) => theme.shadows.buttonShadow};
  border-radius: 8px;
  cursor: pointer;
  @media ${({ theme }) => theme.screens.tablet} {
    max-width: 100%;
  }

  ${({ disabled }) =>
    disabled &&
    css`
      background: ${({ theme }) => theme.grayScale.g3};
    `}
`;

function Button({ href, ...props }: ButtonProps) {
  if (href) {
    return (
      <Link href={href}>
        <StyledButton {...props} />
      </Link>
    );
  }
  return <StyledButton {...props} />;
}

export default Button;
