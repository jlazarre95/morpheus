import { plainToInstance } from "class-transformer";
import { isDefined } from "class-validator";
import { Dict } from "../../../types";
import { changeValue, stringify } from "../../../util/serialization.util";
import { buildArgs, resolveString, validateArgsResolved, ArgDefinition, ArgValue } from "../../args";
import { BlueprintV1Argument, BlueprintV1Blueprint, BlueprintV1Manifest, BlueprintV1Profile } from "./blueprint";
import { BlueprintV1Selector, BlueprintV1XPath } from "./blueprint";


export function getBlueprintV1Selector(selector?: string | BlueprintV1Selector): BlueprintV1Selector | undefined {
    if(!selector) {
        return undefined;
    }
    if (typeof selector === "string") {
        return new BlueprintV1Selector(selector);
    } 
    return selector;
}

export function getBlueprintV1XPath(xPath?: string | BlueprintV1XPath): BlueprintV1XPath | undefined {
    if(!xPath) {
        return undefined;
    }
    if(typeof xPath === "string") {
        return new BlueprintV1XPath(xPath);
    } 
    return xPath;
}

export function transformToBlueprintV1Arguments(value?: Map<string, any>): Map<string, BlueprintV1Argument> {
    const args = new Map<string, BlueprintV1Argument>();
    if(value) {
        for(const [k, v] of value.entries()) {
            if(typeof v === 'string') {
                const isOptional: boolean = v.charAt(v.length - 1) === '?';
                const value: string = isOptional ? v.substring(0, v.length - 1) : v; 
                args.set(k, new BlueprintV1Argument(value, isOptional));
            } else if(typeof v === 'number') {
                args.set(k, new BlueprintV1Argument(v + ''));
            } else if(typeof v === 'boolean') {
                args.set(k, new BlueprintV1Argument(v + ''));
            } else {
                args.set(k, v as any);
            }
        }
    }
    return args;
}

export interface ResolveManifestOptions {
    profile?: string;
    args?: Dict<ArgValue>;
}

export async function resolveBlueprint(manifest: BlueprintV1Manifest, options: ResolveManifestOptions = {}): Promise<BlueprintV1Manifest> {
    const definitions = getArgDefinitions(manifest, options.profile);
    const resolvedArgs: Dict<string | undefined> = buildArgs(definitions, options.args);
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
    changeValue(manifest, reviver);
    const evaluatedManifest = manifest;
    validateArgsResolved(stringify(evaluatedManifest));
    return evaluatedManifest;
}


export function getArgDefinitions(manifest: BlueprintV1Manifest, profile: string | undefined): Dict<ArgDefinition> {
    const definitions: Dict<ArgDefinition> = {};
    const blueprint: BlueprintV1Blueprint = manifest.blueprint;
    if(blueprint.args) {
        for(const [name, definition] of blueprint.args.entries()) {
            definitions[name] = { defaultValue: definition.defaultValue, optional: definition.optional };
        }
    }
    if(profile && blueprint.profiles && blueprint.profiles.get(profile)) {
        const p: BlueprintV1Profile = blueprint.profiles.get(profile)!;
        if(p.args) {
            for(const [name, definition] of p.args.entries()) {
                definitions[name] = { defaultValue: definition.defaultValue, optional: definition.optional };
            }
        }
    }
    return definitions;
}