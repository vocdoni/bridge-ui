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
