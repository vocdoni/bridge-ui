import Link from "next/link";
import React from "react";
import { Button as AragonButton } from "@aragon/ui";

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
