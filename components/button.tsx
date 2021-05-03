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
    ${({ theme }) => theme.gradients.primary.mg1.c1},
    ${({ theme }) => theme.gradients.primary.mg1.c2}
  );
  box-shadow: ${({ theme }) => theme.shadows.buttonShadow};
  border-radius: 8px;
  color: ${({ theme }) => theme.blackAndWhite.w1};
  font-size: 16px;
  font-weight: 500;
  line-height: 22px;

  &:hover {
    box-shadow: ${({ theme }) => theme.shadows.cardShadow};
    background: linear-gradient(
      ${({ theme }) => theme.gradients.primary.mg1_soft.a},
      ${({ theme }) => theme.gradients.primary.mg1_soft.c1},
      ${({ theme }) => theme.gradients.primary.mg1_soft.c2},
      ${({ theme }) => theme.gradients.primary.mg1_soft.c3}
    );
  
  @media ${({ theme }) => theme.screens.tablet} {
    max-width: 100%;
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
  font-size: 16px;
  font-weight: 500;
  line-height: 22px;

  &:hover {
    box-shadow: ${({ theme }) => theme.shadows.cardShadow};
  
  @media ${({ theme }) => theme.screens.tablet} {
    max-width: 100%;
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
