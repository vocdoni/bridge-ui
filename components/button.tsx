import Link from "next/link";
import React from "react";
import { Button as AragonButton } from "@aragon/ui";
import styled from "styled-components";

type AragonButtonProps = {
  mode?: "normal" | "strong" | "positive" | "negative";
  size?: "medium" | "small" | "mini";
  wide?: boolean;
  label?: string;
  icon?: React.ReactNode;
};

interface ButtonProps {
  disabled?: boolean;
  children?: React.ReactNode;
  href?: string;
  onClick?: () => void;
}

export const PrimaryButton = styled(Button)`
  height: 45px;
  padding: 11px 20px 12px;
  background: linear-gradient(
    ${({ theme }) => theme.gradients.primary.mg1.a},
    ${({ theme }) => theme.gradients.primary.mg1.c1} 1.46%,
    ${({ theme }) => theme.gradients.primary.mg1.c2} 100%
  );
  box-shadow: ${({ theme }) => theme.shadows.buttonShadow};
  border-radius: 8px;
  color: ${({ theme }) => theme.blackAndWhite.w1};
  font-size: 16px;
  font-weight: 500;
  font-family: Manrope;
  line-height: 22px;
  position: relative;
  z-index: 1;

  &:before {
    position: absolute;
    content: "";
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    border-radius: 8px;
    box-shadow: ${({ theme }) => theme.shadows.cardShadow};
    background: linear-gradient(
      ${({ theme }) => theme.gradients.primary.mg1_soft.a},
      ${({ theme }) => theme.gradients.primary.mg1_soft.c1} 1.46%,
      ${({ theme }) => theme.gradients.primary.mg1_soft.c2} 99.99%,
      ${({ theme }) => theme.gradients.primary.mg1_soft.c3} 100%
    );
    transition: opacity 300ms ease-in-out;
    opacity: 0;
    z-index: -1;
  }

  &:hover:before {
    opacity: 1;
  }

  @media ${({ theme }) => theme.screens.tablet} {
    width: 100%;
    margin-left: 0;
  }
`;

export const SecondaryButton = styled(Button)`
  height: 45px;
  padding: 12px 20px;
  background: ${({ theme }) => theme.blackAndWhite.w1};
  box-shadow: ${({ theme }) => theme.shadows.buttonShadow};
  border: 2px solid ${({ theme }) => theme.grayScale.g2};
  box-sizing: border-box;
  border-radius: 8px;
  color: ${({ theme }) => theme.primary.p1};
  font-family: Manrope;
  font-size: 16px;
  font-weight: 500;
  line-height: 22px;

  &:hover {
    box-shadow: ${({ theme }) => theme.shadows.cardShadow};
    transition: 300ms ease-in-out;
  }

  @media ${({ theme }) => theme.screens.tablet} {
    width: 100%;
  }
`;

function Button({ href, ...props }: ButtonProps & AragonButtonProps) {
  if (href) {
    return (
      <Link href={href}>
        <AragonButton {...props} />
      </Link>
    );
  }
  return <AragonButton {...props} />;
}

export default Button;
