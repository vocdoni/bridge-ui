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
  children?: React.ReactNode;
  href?: string;
  onClick?: () => void;
}

export const NormalButton = styled(Button)`
  // width: 140px;
  // height: 46px;
  padding: 12px 20px;
  margin-left: 10px;
  background: linear-gradient(
    ${({ theme }) => theme.gradients.primary.mg1.a},
    ${({ theme }) => theme.gradients.primary.mg1.c1},
    ${({ theme }) => theme.gradients.primary.mg1.c2}
  );
  box-shadow: ${({ theme }) => theme.shadows.buttonShadow};
  border-radius: 8px;
  color: ${({ theme }) => theme.blackAndWhite.w1};
  font-size: 16px;
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
