import { isDefined } from "class-validator";
import { BlueprintArgument, BlueprintManifest, BlueprintSelector, BlueprintXPath } from ".";
import { SimulationOptions, SimulationOptionsArg } from "../../simulation/simulation-options";
import { Dict } from "../../types/dict";
import { copy, parse } from "../load";

export function getBlueprintSelector(selector?: string | BlueprintSelector): BlueprintSelector | undefined {
    if(!selector) {
        return undefined;
    }
    if (typeof selector === "string") {
        return new BlueprintSelector(selector);
    } 
    return selector;
}

export function getBlueprintXPath(xPath?: string | BlueprintXPath): BlueprintXPath | undefined {
    if(!xPath) {
        return undefined;
    }
    if(typeof xPath === "string") {
        return new BlueprintXPath(xPath);
    } 
    return xPath;
}

export function transformToBlueprintArguments(value?: Map<string, any>): Map<string, BlueprintArgument> {
    const args = new Map<string, BlueprintArgument>();
    if(value) {
        for(const [k, v] of value.entries()) {
            if(typeof v === 'string') {
                args.set(k, new BlueprintArgument(v, v.charAt(v.length - 1) === '?'));
            } else {
                args.set(k, v as any);
            }
        }
    }
    return args;
}

export function evalString(str: string, params: Dict<string | undefined>, pure: boolean = false): string {
    let modified: string = str;
    for(const key of Object.keys(params)) {
        let k: string = pure ? key: "{{" + key + "}}";
        modified = modified.replace(new RegExp(k, "g"), params[key] ? params[key]! : "");
    }
    return modified;
}

export function argsToDict(names = new Map<string, BlueprintArgument>(), values: SimulationOptionsArg[] = []): Dict<string | undefined> {
    const dict: Dict<string | undefined> = {};
    for(const [name, arg] of names) {
        dict[name] = arg.defaultValue;
    }
    for(const p of values) {
        dict[p.name] = p.value;
    }
    for(const [name, arg] of names) {
        if(!arg.optional && !isDefined(dict[name])) {
            throw new Error(`Argument '${name}' is required but no value was defined`);
        }
    }
    return dict;
}

export async function evaluateArgs(manifest: BlueprintManifest, args: Dict<string | undefined>): Promise<BlueprintManifest> {
    const reviver = function (key: any, value: any) {
        if(typeof value === 'string') {
            return evalString(value, args);
        }
        return value;
    }
    const result: BlueprintManifest = await parse(JSON.parse(JSON.stringify(manifest), reviver), '1', false)
    return result;
}