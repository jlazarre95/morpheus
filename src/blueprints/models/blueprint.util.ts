import { isDefined } from "class-validator";
import { isAbsolute, resolve } from "path";
import { Dict } from "../../types";
import { BlueprintAssertion, BlueprintCorrelation, BlueprintExcludeHeader, BlueprintExcludeUrl, BlueprintFile, BlueprintLogic, BlueprintManifest, BlueprintParameter } from "./blueprint";

export function matchProfile(obj: { profiles?: string[]}, profile?: string): boolean {
    const profiles: string[] = obj.profiles || [];
    if(profiles.length === 0) {
        return true;
    }
    if(!profile) {
        return false;
    }
    if(profiles.includes(`!${profile}`)) {
        return false;
    }
    if(profiles.find(p => p.charAt(0) === '!') !== undefined) {
        return true;
    }
    return profiles.includes(profile);
}

export function getAssertions(manifest: BlueprintManifest, profile?: string): BlueprintAssertion[] {
    const assertions: BlueprintAssertion[] = manifest.blueprint.script?.assertions || [];
    const filteredAssertions = assertions.filter(a => matchProfile(a, profile));
    const profileAssertions: BlueprintAssertion[] = profile ? manifest.blueprint.profiles?.get(profile)?.script?.assertions || [] : [];
    return filteredAssertions.concat(profileAssertions);
}

export function getFiles(manifest: BlueprintManifest, profile?: string, overrides: Dict<string> = {}): BlueprintFile[] {
    const files: BlueprintFile[] = manifest.blueprint.script?.files || [];
    const filteredFiles: BlueprintFile[] = files.filter(a => matchProfile(a, profile));
    const profileFiles: BlueprintFile[] = profile ? manifest.blueprint.profiles?.get(profile)?.script?.files || [] : [];
    return filteredFiles.concat(profileFiles).map(f => {
        if(isDefined(overrides[f.name])) {
            f.sourcePath = overrides[f.name];
        }
        return f;
    });
}

export function resolveSourceFiles(baseDir: string, files: BlueprintFile[]) {
    for(const f of files) {
        if(f.sourcePath) {
            f.sourcePath = isAbsolute(f.sourcePath) ? f.sourcePath : resolve(baseDir, f.sourcePath);
        }
    }
}

// export function validateTargetFiles(files: BlueprintFile[]) {
//     const errors: string[] = [];
//     for(const f of files) {
//         if(f.targetPath && isAbsolute(f.targetPath)) {
//             errors.push(`Target file '${f.name}' must define a relative path, not an absolute one: ${f.targetPath}`)
//         }
//     }
//     if(errors.length > 0) {
//         throw new Error(errors.join('\n'));
//     }
// }

export function getParameters(manifest: BlueprintManifest, profile?: string): BlueprintParameter[] {
    const parameters: BlueprintParameter[] = manifest.blueprint.script?.parameters || [];
    const filteredParameters = parameters.filter(a => matchProfile(a, profile));
    const profileParameters: BlueprintParameter[] = profile ? manifest.blueprint.profiles?.get(profile)?.script?.parameters || [] : [];
    return filteredParameters.concat(profileParameters);
}

export function getCorrelations(manifest: BlueprintManifest, profile?: string): BlueprintCorrelation[] {
    const correlations: BlueprintCorrelation[] = manifest.blueprint.script?.correlations || [];
    const filteredCorrelations = correlations.filter(a => matchProfile(a, profile));
    const profileCorrelations: BlueprintCorrelation[] = profile ? manifest.blueprint.profiles?.get(profile)?.script?.correlations || [] : [];
    return filteredCorrelations.concat(profileCorrelations);
}

export function getLogic(manifest: BlueprintManifest, profile?: string): BlueprintLogic[] {
    const logics: BlueprintLogic[] = manifest.blueprint.script?.logic || [];
    const filteredLogics = logics.filter(a => matchProfile(a, profile));
    const profileLogics: BlueprintLogic[] = profile ? manifest.blueprint.profiles?.get(profile)?.script?.logic || [] : [];
    return filteredLogics.concat(profileLogics);
}

export function getExcludeHeaders(manifest: BlueprintManifest, profile?: string): BlueprintExcludeHeader[] {
    const excludeheaders: BlueprintExcludeHeader[] = manifest.blueprint.script?.excludeHeaders || [];
    const filteredExcludeHeaders = excludeheaders.filter(a => matchProfile(a, profile));
    const profileExcludeHeaders: BlueprintExcludeHeader[] = profile ? manifest.blueprint.profiles?.get(profile)?.script?.excludeHeaders || [] : [];
    return filteredExcludeHeaders.concat(profileExcludeHeaders);
}

export function getExcludeUrls(manifest: BlueprintManifest, profile?: string): BlueprintExcludeUrl[] {
    const excludeurls: BlueprintExcludeUrl[] = manifest.blueprint.script?.excludeUrls || [];
    const filteredExcludeUrls = excludeurls.filter(a => matchProfile(a, profile));
    const profileExcludeUrls: BlueprintExcludeUrl[] = profile ? manifest.blueprint.profiles?.get(profile)?.script?.excludeUrls || [] : [];
    return filteredExcludeUrls.concat(profileExcludeUrls);
}

export function createExcludeHeaders(names: string[]): BlueprintExcludeHeader[] {
    const rules: BlueprintExcludeHeader[] = [];
    for(const name of names) {
        rules.push({ header: name });
    }
    return rules;
}