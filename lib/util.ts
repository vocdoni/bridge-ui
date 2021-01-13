export const areAllNumbers = (slice: any[]) => {
    let found = false
    for (const i in slice) {
        if (typeof slice[i] !== 'number') {
            found = true
            break
        }
    }
    return !found
}

export function limitedText(str: string, maxLength: number = 60): string {
    if (!str || !str.length || str.length < maxLength) return str

    return str.substr(0, maxLength) + "..."
}
