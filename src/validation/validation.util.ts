export function isInt(value: string): boolean {
    return !Number.isNaN(parseInt(value));
}

export function isFloat(value: string): boolean {
    return !Number.isNaN(parseFloat(value));
}

export function isBetween(value: number, minMax: { min: number, max: number }): boolean {
    return minMax.min <= value && value <= minMax.max;
}