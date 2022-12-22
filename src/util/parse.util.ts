import { isDefined } from "class-validator";
import { Ensure } from "../validation";

export interface Range {
    exclude?: boolean,
    from: number,
    to: number,
}

export function getRange(from: number, exclude?: boolean): Range;
export function getRange(from: number, to: number, exclude?: boolean): Range;


export function getRange(from: number, to?: number | boolean, exclude: boolean = false): Range {
    if(typeof to === 'number') {
        return { from, to: isDefined(to) ? to : from, exclude };
    }
    return { from, to: from, exclude: !!to };
}

export function parseRange(r: number | string): Range {
    if(typeof r === 'number') {
        return { exclude: false, from: r, to: r };
    }

    let exclude: boolean = false;
    if(r.charAt(0) === '!') {
        r = r.substring(1);
        exclude = !exclude;
    } 
    if(r.indexOf('-') >= 0) {
        const tokens: string[] = r.split('-');
        const from: number = parseInt(tokens[0]);
        const to: number = parseInt(tokens[1]);
        return { exclude, from, to };
    } 
    const from: number = parseInt(r);
    Ensure.positive('from', from);
    return { exclude, from, to: from };   
}

export function getRanges(ranges: string[]): Range[] {
    const arr: Range[] = [];
    for(let r of ranges) {
        arr.push(parseRange(r));
    }
    return arr;
}