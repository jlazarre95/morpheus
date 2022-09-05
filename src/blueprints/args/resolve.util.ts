import { isDefined } from "class-validator";
import { Dict } from "../../types";
import { setJoin } from "../../util";
import { ArgDefinition, ArgValue } from "./args";

export function resolveString(str: string, args: Dict<string | undefined>, pure: boolean = false): string {
    let modified: string = str;
    for(const key of Object.keys(args)) {
        let k: string = pure ? key: "{{" + key + "}}";
        modified = modified.replace(new RegExp(k, "g"), args[key] ? args[key]! : "");
    }
    return modified;
}

export function buildArgs(definitions: Dict<ArgDefinition> = {}, values: Dict<ArgValue> = {}): Dict<string | undefined> {
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

export function validateArgsResolved(str: string) {
    const errors: Set<string> = new Set<string>();
    for(const unresolved of str.matchAll(new RegExp("{{(.+?)}}", "g"))) {
        errors.add(`Argument '${unresolved[0]}' could not be resolved because it was never defined. Please define the argument in the blueprint if you wish to use it.`);
    }
    if(errors.size != 0) {
        throw new Error(setJoin(errors, ','));
    }
}