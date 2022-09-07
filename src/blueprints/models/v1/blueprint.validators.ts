import { Transform, Type, TransformFnParams, TransformOptions } from "class-transformer";
import { IsNumber, Min, IsOptional, IsString, ValidateNested, IsNotEmpty, Validate } from "class-validator";
import { transformToBlueprintV1Arguments } from ".";
import { isFloat, isInt } from "../../../validation/validation.util";
import { BlueprintV1Selector, BlueprintV1XPath } from "./blueprint";
import { boolean, isBooleanable } from 'boolean';

export function IsBlueprintV1WaitForTimeout() {
    return function (target: any, propertyKey: string) {
        IsNumber()(target, propertyKey);
        Min(0)(target, propertyKey);
        IsOptional()(target, propertyKey);
    };
}

export function IsBlueprintV1WaitForWaitUntil() {
    return function (target: any, propertyKey: string) {
        IsString({ each: true })(target, propertyKey);
        Transform(({ value }) => typeof value === 'string' ? [value] : value)(target, propertyKey);
        IsOptional()(target, propertyKey);
    };
}

export function IsBlueprintV1Selector() {
    return function (target: any, propertyKey: string) {
        ValidateNested()(target, propertyKey);
        Type(() => BlueprintV1Selector)(target, propertyKey);
        Transform(({ value }) => typeof value === 'string' ? new BlueprintV1Selector(value) : value)(target, propertyKey);
    };
}

export function IsBlueprintV1XPath() {
    return function (target: any, propertyKey: string) {
        ValidateNested()(target, propertyKey);
        Type(() => BlueprintV1XPath)(target, propertyKey);
        Transform(({ value }) => typeof value === 'string' ? new BlueprintV1XPath(value) : value)(target, propertyKey);
    };
}

export function IsBlueprintV1Profiles() {
    return function (target: any, propertyKey: string) {
        IsString({ each: true })(target, propertyKey);
        IsNotEmpty({ each: true })(target, propertyKey);
    };
}

export interface TransformArrayFnParams {
    value: any;
    params: TransformFnParams;
}

export function TransformArray<T>(transformFn: (params: TransformArrayFnParams) => T, options?: TransformOptions) {
    return function (target: any, propertyKey: string) {
        Transform(p => {
            const objects: T[] = [];
            if(!Array.isArray(p.value)) {
                return p.value;
            }
            for(const obj of p.value) {
                objects.push(transformFn({ value: obj, params: p }));
            }
            return objects;
        }, options)(target, propertyKey);
    };
}

export function TransformToBoolean() {
    return function (target: any, propertyKey: string) {
        Transform(({ value }) => typeof value === 'string' && isBooleanable(value) ? boolean(value) : value)(target, propertyKey);
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
        Transform(({ value }) => transformToBlueprintV1Arguments(value))(target, propertyKey);
    };
}