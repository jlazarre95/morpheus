import { plainToInstance } from "class-transformer";
import { isDefined } from "class-validator";
import { BlueprintArgument, BlueprintOnlyArgs, BlueprintSelector, BlueprintXPath } from ".";
import { Dict } from "../../types/dict";
import { validateInstance } from "../../validation/class-validator.util";
import { ArgDefinition, ArgValue } from "../args/args";
import { buildArgs, resolveString, validateArgsResolved } from "../args/resolve.util";

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

export async function resolveBlueprint(manifest: any, values: Dict<ArgValue> = {}): Promise<any> {
    const blueprintOnlyArgs: BlueprintOnlyArgs = manifest?.blueprint?.args ? plainToInstance(BlueprintOnlyArgs, manifest.blueprint) : new BlueprintOnlyArgs();
    await validateInstance(blueprintOnlyArgs);
    const definitions = getArgDefinitionsHelper(blueprintOnlyArgs);

    const resolvedArgs: Dict<string | undefined> = buildArgs(definitions, values);
    for(const [name, value] of Object.entries(resolvedArgs)) {
        if(isDefined(value)) {
            resolvedArgs[name] = resolveString(value!, resolvedArgs);
        }
    }

    const reviver = function (_: any, value: any): string {
        if(typeof value === 'string') {
            return resolveString(value, resolvedArgs);
        }
        return value;
    }
    
    let evaluatedManifest: any = JSON.parse(JSON.stringify(manifest), reviver);
    validateArgsResolved(JSON.stringify(evaluatedManifest));
    return evaluatedManifest;
}

function getArgDefinitionsHelper(blueprintOnlyArgs: BlueprintOnlyArgs): Dict<ArgDefinition> {
    const definitions: Dict<ArgDefinition> = {};
    if(blueprintOnlyArgs.args) {
        for(const [name, definition] of blueprintOnlyArgs.args.entries()) {
            definitions[name] = { defaultValue: definition.defaultValue, optional: definition.optional };
        }
    }
    return definitions;
}