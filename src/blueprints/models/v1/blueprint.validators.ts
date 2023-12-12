import { Transform, Type, TransformFnParams, TransformOptions } from "class-transformer";
import { IsNumber, Min, IsOptional, IsString, ValidateNested, IsNotEmpty, Validate, IsArray } from "class-validator";
import { transformToBlueprintV1Arguments } from ".";
import { isFloat, isInt } from "../../../validation/validation.util";
import { BlueprintV1TimeUnit, BlueprintV1Range, BlueprintV1Replace, BlueprintV1ReplaceFilter, BlueprintV1Selector, BlueprintV1XPath, BlueprintV1Duration } from "./blueprint";
import { boolean, isBooleanable } from 'boolean';
import { parseRange } from "../../../util";
import { Dict } from "../../../types";

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

export function IsBlueprintV1Ranges() {
    return function (target: any, propertyKey: string) {
        ValidateNested({ each: true })(target, propertyKey)
        Type(() => BlueprintV1Range)(target, propertyKey)
        Transform(({ value }) => ['number', 'string'].indexOf(typeof value) >= 0 ? [new BlueprintV1Range(parseRange(value))] : value)(target, propertyKey)
        TransformArray(({ value }) => ['number', 'string'].indexOf(typeof value) >= 0 ? new BlueprintV1Range(parseRange(value)) : value)(target, propertyKey)
    };
}
export function IsBlueprintV1Replace() {
    return function (target: any, propertyKey: string) {
        ValidateNested({ each: true })(target, propertyKey)
        Type(() => BlueprintV1Replace)(target, propertyKey)
        Transform(({ value }) => typeof value === 'string' ? [new BlueprintV1Replace(value)] : value)(target, propertyKey)
        TransformArray(({ value }) => typeof value === 'string' ? new BlueprintV1Replace(value) : value)(target, propertyKey)
    };
}

export function IsBlueprintV1ReplaceFilters() {
    return function (target: any, propertyKey: string) {
        ValidateNested({ each: true })(target, propertyKey)
        Type(() => BlueprintV1ReplaceFilter)(target, propertyKey)
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
        IsArray()(target, propertyKey);
    };
}

export function TransformToBoolean() {
    return function (target: any, propertyKey: string) {
        Transform(({ value }) => typeof value === 'string' && isBooleanable(value) ? boolean(value) : value)(target, propertyKey);
    };
}

export function TransformToInt() {
    return function (target: any, propertyKey: string) {
        // Transform(({ value }) => value)(target, propertyKey);
        // Transform(({ value }) => {
        Transform(({ value }) => typeof value === 'string' && isInt(value) ? parseInt(value) : value)(target, propertyKey);
        // })(target, propertyKey);
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

export function TransformLookup(dict: Dict<any>) {
    return function (target: any, propertyKey: string) {
        Transform(({ value }) => dict[value] || value)(target, propertyKey);
    };
}

export function TransformToTimeUnit() {
    return function (target: any, propertyKey: string) {
        TransformLookup({
            'ms': BlueprintV1TimeUnit.milliseconds,
            'millisec': BlueprintV1TimeUnit.milliseconds,
            'millisecs': BlueprintV1TimeUnit.milliseconds,
            'millisecond': BlueprintV1TimeUnit.milliseconds,
            'milliseconds': BlueprintV1TimeUnit.milliseconds,
            's': BlueprintV1TimeUnit.seconds,
            'sec': BlueprintV1TimeUnit.seconds,
            'secs': BlueprintV1TimeUnit.seconds,
            'second': BlueprintV1TimeUnit.seconds,
            'seconds': BlueprintV1TimeUnit.seconds,
            'm': BlueprintV1TimeUnit.minutes,
            'min': BlueprintV1TimeUnit.minutes,
            'minute': BlueprintV1TimeUnit.minutes,
            'minutes': BlueprintV1TimeUnit.minutes,
            'h': BlueprintV1TimeUnit.hours,
            'hr': BlueprintV1TimeUnit.hours,
            'hrs': BlueprintV1TimeUnit.hours,
            'hour': BlueprintV1TimeUnit.hours,
            'hours': BlueprintV1TimeUnit.hours,
            'd': BlueprintV1TimeUnit.days,
            'day': BlueprintV1TimeUnit.days,
            'days': BlueprintV1TimeUnit.days,
            'w': BlueprintV1TimeUnit.weeks,
            'wk': BlueprintV1TimeUnit.weeks,
            'wks': BlueprintV1TimeUnit.weeks,
            'week': BlueprintV1TimeUnit.weeks,
            'weeks': BlueprintV1TimeUnit.weeks,
            'M': BlueprintV1TimeUnit.months,
            'mth': BlueprintV1TimeUnit.months,
            'mths': BlueprintV1TimeUnit.months,
            'month': BlueprintV1TimeUnit.months,
            'months': BlueprintV1TimeUnit.months,
            'y': BlueprintV1TimeUnit.years,
            'yr': BlueprintV1TimeUnit.years,
            'yrs': BlueprintV1TimeUnit.years,
            'year': BlueprintV1TimeUnit.years,
            'years': BlueprintV1TimeUnit.years,
        })(target, propertyKey);
    };
}

export function IsBlueprintV1Duration() {
    return function (target: any, propertyKey: string) {
        ValidateNested()(target, propertyKey);
        Type(() => BlueprintV1Duration)(target, propertyKey);
        Transform(({ value }) => typeof value === 'number' ? new BlueprintV1Duration(value) : value)(target, propertyKey);
    };
}