import * as V1 from "../blueprints/v1";

export function getNumberOfScreenshotCommands(manifest: V1.BlueprintManifest): number {
    let screenshots: number = 0;
    manifest.blueprint.simulation?.actions.forEach(a => a.commands?.forEach(c => {
        if(c.screenshot) {
            screenshots++;
        }
    }));
    return screenshots;
}

export function getScreenshotName(name: string, num: number, total: number, orderScreenshots?: boolean): string {
    if(!orderScreenshots) {
        return name;
    }
    let zeroes: string = '';
    const numZeroes: number = Math.floor(Math.log10(total)) - Math.floor(Math.log10(num));
    for(let i = 0; i < numZeroes; i++) {
        zeroes += '0';
    }
    return `${zeroes}${num}_${name}`;
}