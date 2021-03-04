export const areAllNumbers = (slice: any[]) => {
    for (let i = 0; i < slice.length; i++) {
        if (typeof slice[i] !== "number") {
            return false;
        }
    }
    return true;
};

export function limitedText(str: string, maxLength: number = 60): string {
    if (!str || !str.length || str.length < maxLength) return str;

    return str.substr(0, maxLength) + "...";
}
export function throwIfNotBrowser() {
    if (typeof window == "undefined")
        throw new Error(
            "The storage component should only be used on the web browser side"
        );
}

/**
 * @param address - address to modify
 * @param slashIndex - number of letters to show at beginning of address
 * @returns formatted address
 */
export function shortAddress(address: string, slashIndex = 15): string {
    // An ethereum address has 42 characters
    return address.slice(0, slashIndex) + "..." + address.slice(38, 42);
}
