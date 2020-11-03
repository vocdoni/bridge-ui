type Props = {
    children: any,
    name: string,
    icon: string,
    rightText?: string,
    onClick: () => any
}

export default function TokenCard({ children, ...props }: Props) {
    return <div className="token-card" onClick={() => props.onClick()}>
        <a href="#">
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
