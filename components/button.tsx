import Link from "next/link"

type Props = {
    children: any,
    href?: string,
    onClick?: () => any
}

export default function Button({ children, ...props }: Props) {
    if (props.onClick) return <div className="button accent-2" onClick={() => props.onClick()}>
        {children}
    </div>

    return <Link href={props.href}>
        <div className="button accent-2">
            {children}
        </div>
    </Link>
}
