import { createReadStream, readFile } from "fs-extra";
import { createInterface } from "readline";
import { Dict } from "../../../../types";
import { BlueprintFile } from "../../../models";

export async function getNumRecords(files: BlueprintFile[]): Promise<Dict<number>> {
    const records: Dict<number> = {};
    for(const f of files) {
        records[f.name] = await countLines(f.sourcePath!) - 1;
    }
    return records;
}

export async function countLines(path: string): Promise<number> {
    let numLines = 0;
    const rl = createInterface({
        input: createReadStream(path),
        output: process.stdout,
        terminal: false
    });
    await new Promise((resolve, reject) => {
        rl.on('line', function (line) {
            numLines++; 
        });
        rl.on('error', function (err) {
            reject(err)
        });
        rl.on('close', function () {
            resolve(null);
        });
    });
    return numLines;
}