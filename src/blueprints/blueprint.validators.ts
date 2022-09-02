import { Transform, Type } from "class-transformer";
import { IsNumber, Min, IsOptional, IsString, ValidateNested } from "class-validator";
import { BlueprintSelector, BlueprintXPath } from "./v1";

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