import { Ensure } from "../validation";

export function stringsToRanges(ranges: string[]): { from: number, to: number }[] {
    const arr: { from: number, to: number }[] = [];
    for(const r of ranges) {
        if(r.indexOf('-') >= 0) {
            const tokens: string[] = r.split('-');
            const from: number = parseInt(tokens[0]);
            const to: number = parseInt(tokens[1]);
            arr.push({ from, to });
        } else {
            const from: number = parseInt(r);
            Ensure.positive('from', from);
            arr.push({ from, to: from });
        }
    }
    return arr;
}