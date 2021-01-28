import { useState, useEffect } from "react"

function useWindowEvent(event: string, callback: EventListener) {
    useEffect(() => {
        window.addEventListener(event, callback)
        return () => window.removeEventListener(event, callback)
    }, [event, callback])
}

export function useUrlHash(): string {
    const [urlHash, setUrlHash] = useState(typeof window != "undefined" ? location.hash : "")

    useWindowEvent("hashchange", (e: HashChangeEvent) => {
        if (urlHash == location.hash) return

        setUrlHash(location.hash)
    })

    return urlHash || ""
}
