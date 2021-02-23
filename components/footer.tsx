import Link from "next/link"
// import AppContext from './app-context'
// import { useContext } from "react"

type Props = {
    children?: any
}

export function Footer({ children, ...props }: Props) {
    return <div id="footer">
        <div className="left"><a href="https://discord.gg/sQCxgYs" target="_blank">Discord</a> · <a href="https://twitter.com/vocdoni" target="_blank">Twitter</a> · <a href="https://t.me/vocdoni" target="_blank">Telegram</a></div>
        <div className="right">Vocdoni {new Date().getFullYear()}</div>
    </div>
}
