import { plainToClass } from "class-transformer";
import { validate as validateInstance, ValidationError } from "class-validator";
import { readFile } from "fs-extra";
import { parse as parseYaml } from "yaml";
import { getValidationErrorMessage } from "../util/validation.util";
import { supportedManifestVersions } from "./supported-manifest-versions";
import * as V1 from "./v1";

export async function load(path: string, version: '1'): Promise<V1.BlueprintManifest> {
    const obj = parseYaml((await readFile(path)).toString());
    return parse(obj, version);
}

export async function copy(manifest: V1.BlueprintManifest): Promise<V1.BlueprintManifest> {
    return parse(JSON.parse(JSON.stringify(manifest)), '1', false);
}

export async function parse(obj: any, version: '1', validate: boolean = true): Promise<V1.BlueprintManifest> { 
    if(typeof obj.version !== 'string') {
        throw new Error(`'version' must be of type string`);
    }
    if(obj.version === '1') {
        const instance = plainToClass(V1.BlueprintManifest, obj);
        if(validate) {
            const errors = await validateInstance(instance, { whitelist: true, forbidNonWhitelisted: true });
            if(errors.length > 0) {
                throw new Error(getValidationErrorMessage(errors));
            }
        }
        return instance;
    } else {
        throw new Error(`Version '${obj.version}' is not supported. Please use one of the following versions: ${supportedManifestVersions}`);
    }
}