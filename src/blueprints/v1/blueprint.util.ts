import { plainToInstance } from "class-transformer";
import { isDefined } from "class-validator";
import { BlueprintArgument, BlueprintManifest, BlueprintOnlyArgs, BlueprintSelector, BlueprintXPath } from ".";
import { ArgDefinition, ArgValue } from "../../simulation/args";
import { Dict } from "../../types/dict";
import { validateInstance } from "../../util/validation.util";

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
                const isOptional: boolean = v.charAt(v.length - 1) === '?';
                const value: string = isOptional ? v.substring(0, v.length - 1) : v; 
                args.set(k, new BlueprintArgument(value, isOptional));
            } else if(typeof v === 'number') {
                args.set(k, new BlueprintArgument(v + ''));
            } else if(typeof v === 'boolean') {
                args.set(k, new BlueprintArgument(v + ''));
            } else {
                args.set(k, v as any);
            }
        }
    }
    return args;
}

export function evalString(str: string, args: Dict<string | undefined>, pure: boolean = false): string {
    let modified: string = str;
    for(const key of Object.keys(args)) {
        let k: string = pure ? key: "{{" + key + "}}";
        modified = modified.replace(new RegExp(k, "g"), args[key] ? args[key]! : "");
    }
    return modified;
}

// export function getArgs(manifest: BlueprintManifest, values: Dict<ArgValue> = {}): Dict<string | undefined>{
//     return getArgsHelper(getArgDefinitions(manifest), values);
// }

export async function resolveBlueprint(manifest: any, values: Dict<ArgValue> = {}): Promise<any> {
    const blueprintOnlyArgs: BlueprintOnlyArgs = manifest?.blueprint?.args ? plainToInstance(BlueprintOnlyArgs, manifest.blueprint) : new BlueprintOnlyArgs();
    await validateInstance(blueprintOnlyArgs);
    const definitions = getArgDefinitionsHelper(blueprintOnlyArgs);

    const resolvedArgs: Dict<string | undefined> = getArgsHelper(definitions, values);
    for(const [name, value] of Object.entries(resolvedArgs)) {
        if(isDefined(value)) {
            resolvedArgs[name] = evalString(value!, resolvedArgs);
        }
    }

    const reviver = function (_: any, value: any): string {
        if(typeof value === 'string') {
            return evalString(value, resolvedArgs);
        }
        return value;
    }
    
    let evaluatedManifest: any = JSON.parse(JSON.stringify(manifest), reviver);
    validateArgsResolved(JSON.stringify(evaluatedManifest));
    return evaluatedManifest;
}

// export async function evaluateArgs(manifest: BlueprintManifest, args: Dict<string | undefined>): Promise<BlueprintManifest> {   
//     const reviver = function (key: any, value: any) {
//         if(typeof value === 'string') {
//             return evalString(value, args);
//         }
//         return value;
//     }
//     const result: BlueprintManifest = await evaluateManifest(JSON.parse(JSON.stringify(manifest), reviver), '1');
//     return result;
// }

// function getArgDefinitions(manifest: BlueprintManifest): Dict<ArgDefinition> {
//     return getArgDefinitionsHelper(manifest.blueprint); 
// }

function getArgDefinitionsHelper(blueprintOnlyArgs: BlueprintOnlyArgs): Dict<ArgDefinition> {
    const definitions: Dict<ArgDefinition> = {};
    if(blueprintOnlyArgs.args) {
        for(const [name, definition] of blueprintOnlyArgs.args.entries()) {
            definitions[name] = { defaultValue: definition.defaultValue, optional: definition.optional };
        }
    }
    return definitions;
}

function getArgsHelper(definitions: Dict<ArgDefinition> = {}, values: Dict<ArgValue> = {}): Dict<string | undefined> {
    const args: Dict<string | undefined> = {};
    for(const [name, definition] of Object.entries(definitions)) {
        args[name] = definition.defaultValue;
    }
    let errors: string[] = [];
    for(const [name, value] of Object.entries(values)) {
        if(!definitions[name]) {
            errors.push(`Argument '${name}' not expected. Please define the argument in the blueprint if you wish to use it.`);
        }
        if(isDefined(value.value)) {
            args[name] = value.value;
        }
    }

    for(const [name, definition] of Object.entries(definitions)) {
        if(!definition.optional && !isDefined(args[name])) {
            errors.push(`Argument '${name}' is required but no value was defined. If you wish to mark it as optional, please do so in the blueprint.`);
        }
    }
    if(errors.length != 0) {
        throw new Error(errors.join('\n'));
    }
    return args;
}

function validateArgsResolved(str: string) {
    const errors: Set<string> = new Set<string>();
    for(const unresolved of str.matchAll(new RegExp("{{(.+?)}}", "g"))) {
        errors.add(`Argument '${unresolved[0]}' could not be resolved because it was never defined. Please define the argument in the blueprint if you wish to use it.`);
    }
    if(errors.size != 0) {
        throw new Error(setJoin(errors, ','));
    }
}

function setJoin(set: Set<string>, delimiter: string): string {
    let message: string = '';
    for(const value of set.values()) {
        message += value + delimiter;
    }
    return message === '' ? message : message.substring(0, message.length - 1);
}