import { Transform, Type } from "class-transformer";
import { IsNumber, Min, IsOptional, IsString, ValidateNested } from "class-validator";
import { BlueprintSelector, BlueprintXPath, transformToBlueprintArguments } from "./v1";

export function IsWaitForTimeout() {
    return function (target: any, propertyKey: string) {
        IsNumber()(target, propertyKey);
        Min(0)(target, propertyKey);
        IsOptional()(target, propertyKey);
    };
}

export function IsWaitForWaitUntil() {
    return function (target: any, propertyKey: string) {
        IsString({ each: true })(target, propertyKey);
        Transform(({ value }) => typeof value === 'string' ? [value] : value)(target, propertyKey);
        IsOptional()(target, propertyKey);
    };
}

export function IsBlueprintSelector() {
    return function (target: any, propertyKey: string) {
        ValidateNested()(target, propertyKey);
        Type(() => BlueprintSelector)(target, propertyKey);
        Transform(({ value }) => typeof value === 'string' ? new BlueprintSelector(value) : value)(target, propertyKey);
    };
}

export function IsBlueprintXPath() {
    return function (target: any, propertyKey: string) {
        ValidateNested()(target, propertyKey);
        Type(() => BlueprintXPath)(target, propertyKey);
        Transform(({ value }) => typeof value === 'string' ? new BlueprintXPath(value) : value)(target, propertyKey);
    };
}

export function TransformToInt() {
    return function (target: any, propertyKey: string) {
        Transform(({ value }) => typeof value === 'string' && isInt(value) ? parseInt(value) : value)(target, propertyKey);
    };
}

export function TransformToFloat() {
    return function (target: any, propertyKey: string) {
        Transform(({ value }) => typeof value === 'string' && isFloat(value) ? parseFloat(value) : value)(target, propertyKey);
    };
}

export function TransformToArgs() {
    return function (target: any, propertyKey: string) {
        Transform(({ value }) => transformToBlueprintArguments(value))(target, propertyKey);
    };
}
function isInt(value: string): boolean {
    try {
        parseInt(value);
        return true;
    } catch(err) {
        return false;
    }
}

function isFloat(value: string): boolean {
    try {
        parseFloat(value);
        return true;
    } catch(err) {
        return false;
    }
}


// export function IsWaitForSelectorOptionsVisible() {
//     return function (target: any, propertyKey: string) {
//         IsBoolean()(target, propertyKey);
//         IsOptional()(target, propertyKey);
//     };
// }
// export function IsWaitForSelectorOptionsHidden() {
//     return function (target: any, propertyKey: string) {
//         IsBoolean()(target, propertyKey);
//         IsOptional()(target, propertyKey);
//     };
// }

// export function IsWaitForSelectorOptionsTimeout() {
//     return function (target: any, propertyKey: string) {
//         IsNumber()(target, propertyKey);
//         Min(0)(target, propertyKey);
//         IsOptional()(target, propertyKey);
//     };
// }