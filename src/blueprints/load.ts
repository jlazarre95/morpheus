import { plainToInstance } from "class-transformer";
import { isDefined } from "class-validator";
import { readFile } from "fs-extra";
import { parse as parseYaml } from "yaml";
import { ArgValue } from "../simulation/args";
import { Dict } from "../types/dict";
import { validateInstance } from "../util/validation.util";
import { supportedManifestVersions } from "./supported-manifest-versions";
import * as V1 from "./v1";
import { resolveBlueprint } from "./v1";

export interface CreateManifestOptions {
    args?: Dict<ArgValue>;
    resolve?: boolean;
}

export async function loadBlueprintFile(path: string): Promise<any> {
    return parseYaml((await readFile(path)).toString());
}

export async function copyBlueprint(manifest: V1.BlueprintManifest): Promise<V1.BlueprintManifest> {
    return createBlueprint(JSON.parse(JSON.stringify(manifest)), '1');
}

export async function createBlueprint(obj: any, version: '1', options: CreateManifestOptions = {}): Promise<V1.BlueprintManifest> { 
    const resolve: boolean = isDefined(options.resolve) ? options.resolve! : true;
    if(typeof obj.version !== 'string') {
        throw new Error(`'version' must be of type string`);
    }
    if(obj.version === '1') {
        const manifest = resolve ? await resolveBlueprint(obj, options.args) : obj;
        const instance = plainToInstance(V1.BlueprintManifest, manifest);
        await validateInstance(instance, { whitelist: true, forbidNonWhitelisted: true });
        return instance;
    } else {
        throw new Error(`Version '${obj.version}' is not supported. Please use one of the following versions: ${supportedManifestVersions}`);
    }
}