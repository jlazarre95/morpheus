import { plainToInstance } from "class-transformer";
import { pathExists, readFile } from "fs-extra";
import { version } from "moment";
import { dirname, isAbsolute, join, resolve } from "path";
import { parse as parseYaml } from "yaml";
import { Dict } from "../types/dict";
import { validateInstance } from "../validation/class-validator.util";
import { ArgValue } from "./args/args";
import { BlueprintFile, BlueprintManifest } from "./models";
import { getFiles, resolveSourceFiles } from "./models/blueprint.util";
import { BlueprintV1Manifest, resolveBlueprint } from "./models/v1";
import { supportedManifestVersions } from "./supported-manifest-versions";

export interface LoadBlueprintFileOptions {
    args?: Dict<ArgValue>;
    fileOverrides?: Dict<string>;
    profile?: string;
    disableArgResolution?: boolean;
    disableValidation?: boolean;
    disableFileValidation?: boolean;
    disableFileDefinitionValidation?: boolean;
}

export async function loadBlueprint(path: string, options: LoadBlueprintFileOptions = {}): Promise<BlueprintManifest> {
    const { profile, fileOverrides, disableFileDefinitionValidation } = options;

    const manifestFile: any = parseYaml((await readFile(path)).toString());
    if(typeof manifestFile.version !== 'string') {
        throw new Error(`'version' must be of type string`);
    }
    let manifest: BlueprintManifest;
    if(manifestFile.version === '1') {
        const manifestV1 = plainToInstance(BlueprintV1Manifest, manifestFile);
        const resolvedManifestV1 = !options.disableArgResolution ? await resolveBlueprint(manifestV1, { args: options.args, profile: options.profile }) : manifestV1;
        if(!options.disableValidation) {
            await validateInstance(resolvedManifestV1, { whitelist: true, forbidNonWhitelisted: true });
        }
        // console.log(JSON.stringify(resolvedManifestV1, null, 4))
        manifest = resolvedManifestV1.getManifest();
        
    } else {
        throw new Error(`Unsupported version: ${version}. Please specify one of the following versions: ${supportedManifestVersions}`);
    }
    // console.log(manifest.blueprint.profiles)
    let files: BlueprintFile[] = getFiles(manifest, profile, fileOverrides);
    resolveSourceFiles(dirname(path), files);

    if(!options.disableValidation && !options.disableFileValidation) {
        await vaildateFiles(files, { profile, fileOverrides, definedSources: !disableFileDefinitionValidation });
    }
    return manifest;
}

export async function vaildateFiles(files: BlueprintFile[], options: { profile?: string, fileOverrides?: Dict<string>, definedSources?: boolean } = {}) {
    const { profile, fileOverrides = {}, definedSources } = options;
    const errors: string[] = [];
    const filenames: Set<string> = new Set<string>();
    for(const f of files) {
        filenames.add(f.name);
        if(!f.sourcePath && definedSources) {
            errors.push(`Expected source path for file '${f.name}' to be defined`);
            continue;
        }
        if(f.sourcePath && (!await pathExists(f.sourcePath))) {
            errors.push(`Expected file '${f.name}' to exist at path: ${f.sourcePath}`);
        }
        if(f.targetPath && isAbsolute(f.targetPath)) {
            errors.push(`Target file '${f.name}' must define a relative path, not an absolute one: ${f.targetPath}`)
        }
    }
    for(const [name, sourcePath] of Object.entries(fileOverrides)) {
        if(!filenames.has(name)) {
            errors.push(`File override '${name}' not expected. Please specify the file in the blueprint if you wish to use it.`);
        }
    }
    if(errors.length > 0) {
        throw new Error(errors.join('\n'));
    }
    return 
}

// export interface CreateManifestOptions {
//     args?: Dict<ArgValue>;
//     resolve?: boolean;
//     profile?: string;
// }

// export async function copyBlueprint(manifest: V1.BlueprintManifest): Promise<V1.BlueprintManifest> {
//     return createBlueprint(JSON.parse(JSON.stringify(manifest)), '1');
// }

// export function createBlueprint(obj: any, version: '1', options?: CreateManifestOptions): Promise<V1.BlueprintManifest>;

// export async function createBlueprint(obj: any, version: '1', options: CreateManifestOptions = {}): Promise<V1.BlueprintManifest> { 
//     const resolve: boolean = isDefined(options.resolve) ? options.resolve! : true;
//     if(typeof obj.version !== 'string') {
//         throw new Error(`'version' must be of type string`);
//     }
//     if(obj.version === '1') {
//         const manifest = resolve ? await resolveBlueprint(obj, options.args, options.profile) : obj;
//         const instance = plainToInstance(V1.BlueprintManifest, manifest);
//         await validateInstance(instance, { whitelist: true, forbidNonWhitelisted: true });
//         return instance;
//     } else {
//         throw new Error(`Version '${obj.version}' is not supported. Please use one of the following versions: ${supportedManifestVersions}`);
//     }
// }