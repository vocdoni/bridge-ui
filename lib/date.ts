export function strDateDiff(target: Date): string {
    if (!target) return ""
    const diff = target.getTime() - Date.now()
    let num: number

    if (diff > 3000) {
        // future
        if (diff > 1000 * 60 * 60 * 24) {
            num = Math.floor(diff / 1000 * 60 * 60 * 24)
            return num > 1 ? `in ${num} days` : "in 1 day"
        } else if (diff > 1000 * 60 * 60) {
            num = Math.floor(diff / 1000 * 60 * 60)
            return num > 1 ? `in ${num} hours` : "in 1 hour"
        } else if (diff > 1000 * 60) {
            num = Math.floor(diff / 1000 * 60)
            return num > 1 ? `in ${num} minutes` : "in 1 minute"
        } else {
            num = Math.floor(diff / 1000)
            return `in ${num} seconds`
        }
    } else if (diff < -3000) {
        // past
        if (diff > 1000 * 60 * 60 * 24) {
            num = Math.floor(diff / 1000 * 60 * 60 * 24)
            return num > 1 ? `${num} days ago` : "1 day ago"
        } else if (diff > 1000 * 60 * 60) {
            num = Math.floor(diff / 1000 * 60 * 60)
            return num > 1 ? `${num} hours ago` : "1 hour ago"
        } else if (diff > 1000 * 60) {
            num = Math.floor(diff / 1000 * 60)
            return num > 1 ? `${num} minutes ago` : "1 minute ago"
        } else {
            num = Math.floor(diff / 1000)
            return `${num} seconds ago`
        }
    } else {
        return "right now"
    }
}
