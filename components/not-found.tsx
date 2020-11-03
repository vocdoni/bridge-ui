// import Link from "next/link"
import { main } from "../i18n"

const NotFound = props => <div id="page-body">
    <div className="not-found body-card center">
        <h1>Vocdoni Bridge</h1>
        <p>{main.notFound}</p>
    </div>
</div>

export default NotFound
