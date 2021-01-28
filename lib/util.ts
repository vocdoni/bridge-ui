export const areAllNumbers = (slice: any[]) => {
    for (let i = 0; i < slice.length; i++) {
        if (typeof slice[i] !== 'number') {
            return false
        }
    }
    return true
}

export function limitedText(str: string, maxLength: number = 60): string {
    if (!str || !str.length || str.length < maxLength) return str

    return str.substr(0, maxLength) + "..."
}
