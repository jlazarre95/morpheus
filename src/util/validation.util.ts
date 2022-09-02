import { isPositive, ValidationError } from "class-validator";

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


interface IValidationErrorEntry {
    prefix: string;
    error: ValidationError;
}

export interface IValidationErrorMessageOptions {
    prefix?: string;
    suffix?: string;
    parent?: boolean;
}

export function getValidationErrorMessage(errors: ValidationError[], options: IValidationErrorMessageOptions = {}): string {
    const { prefix = "- ", suffix = "\n", parent = true } = options;
    
    let message: string = "";
    const stk: IValidationErrorEntry[] = []; 
    for(let i = errors.length - 1; i >= 0; i--) {
        const error: ValidationError = errors[i];
        stk.push({ 
            prefix: "$", 
            error: error 
        });
    }
    while(stk.length > 0) {
        const entry: IValidationErrorEntry = stk.pop()!;
        for(const constraintKey in entry.error.constraints) {
            message += prefix;
            message += (parent ? entry.prefix + ": " : ""); 
            message += entry.error.constraints[constraintKey];
            message += suffix;
        }
        if(entry.error.children) {
            for(let i = entry.error.children.length - 1; i >= 0; i--) {
                const child: ValidationError = entry.error.children[i];
                stk.push({ 
                    prefix: entry.prefix + "." +  entry.error.property, 
                    error: child 
                });
            }
        }
    }
    return message;
}

