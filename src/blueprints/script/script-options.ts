import { Dict } from "../../types";
import { BlueprintManifest } from "../models";

// export interface ScriptOptionsFile {
//     name: string;
//     sourcePath: string;
//     targetPath?: string;
// }

export interface ScriptOptions {
    profile?: string;
    outputDir?: string;
    files?: Dict<string>;
    manifest?: BlueprintManifest;
    date?: Date;
    actionsPath?: string;
}