import { isPositive } from "class-validator";

export namespace Ensure {

    export function isGt(value1: number, value2: number) {
        return value1 > value2;
    }

    export function isGte(value1: number, value2: number) {
        return value1 >= value2;
    }

    export function nonnegative(name: string, value: number) {
        if(value < 0) {
            throw new Error(`'${name}' must be 0 or greater: ${value}`);
        }
    }
    
    export function gt(name1: string, value1: number, name2: string, value2: number) {
        if(value1 <= value2) {
            throw new Error(`'${name1}' (${value1}) must be greater than ${name2} (${value2})`);
        }
    }
    
    export function positive(name: string, value: number) {
        if(!isPositive(value)) {
            throw new Error(`'${name}' must be positive: ${value}`);
        }
    }

}