import { ClassConstructor, plainToInstance } from "class-transformer";

function replacer(key: string, value: any): any {
    if(value instanceof Map) {
        const object: any = {};
        for(const [k, v] of value.entries()) {
            object[k] = replacer(k, v);
        }
        return object;
    } else {
        return value;
    }
}

export function stringify(obj: any, space: string | number | undefined = 4): string {
    return JSON.stringify(obj, (key: string, value: any) => replacer(key, value), space);
}

export function changeValue<T>(obj: T, reviver: (key: any, value: any) => any) {
    if(typeof obj === 'object') {
        for (var key in obj) {
            if(obj[key] instanceof Map) {
                for(const [name, value] of (obj[key] as Map<any, any>).entries()) {
                    changeValue(value, reviver);
                }
            } else if (typeof obj[key] === 'object') {
                changeValue(obj[key], reviver);
            } else {
                obj[key] = reviver(key, obj[key]);
            }
        }
    }
}

export function copyInstance<T>(cls: ClassConstructor<T>, obj: T) {
    return plainToInstance(cls, JSON.parse(stringify(obj)));
}