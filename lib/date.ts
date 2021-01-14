export function strDateDiff(type: "start-date" | "end-date", target: Date): string {
    if (!target) return ""
    let diff = (target.getTime() - Date.now()) / 1000
    let num: number, prefix: string

    if (diff > 3) {
        prefix = type == "start-date" ? "starting" :
            type == "end-date" ? "ending" : ""

        // future
        if (diff > 60 * 60 * 24) {
            num = Math.floor(diff / 60 / 60 / 24)
            return num > 1 ? `${prefix} in ${num} days` : prefix + " in 1 day"
        } else if (diff > 60 * 60) {
            num = Math.floor(diff / 60 / 60)
            return num > 1 ? `${prefix} in ${num} hours` : prefix + " in 1 hour"
        } else if (diff > 60) {
            num = Math.floor(diff / 60)
            return num > 1 ? `${prefix} in ${num} minutes` : prefix + " in 1 minute"
        } else {
            num = Math.floor(diff)
            return `${prefix} in ${num} seconds`
        }
    } else if (diff < -3) {
        prefix = type == "start-date" ? "started" :
            type == "end-date" ? "ended" : ""

        diff = -diff

        // past
        if (diff > 60 * 60 * 24) {
            num = Math.floor(diff / 60 / 60 / 24)
            return num > 1 ? `${prefix} ${num} days ago` : prefix + " 1 day ago"
        } else if (diff > 60 * 60) {
            num = Math.floor(diff / 60 / 60)
            return num > 1 ? `${prefix} ${num} hours ago` : prefix + " 1 hour ago"
        } else if (diff > 60) {
            num = Math.floor(diff / 60)
            return num > 1 ? `${prefix} ${num} minutes ago` : prefix + " 1 minute ago"
        } else {
            num = Math.floor(diff)
            return `${prefix} ${num} seconds ago`
        }
    } else {
        prefix = type == "start-date" ? "starting" :
            type == "end-date" ? "ending" : ""

        return "right now"
    }
}
