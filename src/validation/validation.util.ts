export function isInt(value: string): boolean {
    try {
        parseInt(value);
        return true;
    } catch(err) {
        return false;
    }
}

export function isFloat(value: string): boolean {
    try {
        parseFloat(value);
        return true;
    } catch(err) {
        return false;
    }
}

export function isBetween(value: number, minMax: { min: number, max: number }): boolean {
    return minMax.min <= value && value <= minMax.max;
}