import Link from "next/link"

type Props = {
    key?: any,
    children: any,
    name: string,
    icon: string,
    rightText?: string,
    href?: string,
    onClick?: () => any
}

export default function TokenCard({ children, ...props }: Props) {
    if (props.href) {
        return <div className="token-card">
            <Link href={props.href || "#"}>
                <a>
                    <div className="content">
                        <img src={props.icon} />
                        {props.rightText && <span style={{ float: "right" }}>{props.rightText}</span>}
                        <div className="text">
                            <h3>{props.name}</h3>
                            {children}
                        </div>
                    </div>
                </a>
            </Link>
        </div>
    }

    return <div className="token-card" onClick={() => props.onClick && props.onClick()}>
        <a>
            <div className="content">
                <img src={props.icon} />
                {props.rightText && <span style={{ float: "right" }}>{props.rightText}</span>}
                <div className="text">
                    <h3>{props.name}</h3>
                    {children}
                </div>
            </div>
        </a>
    </div>
}
