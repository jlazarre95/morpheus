export interface SimulationOptionsArg {
    name: string;
    value?: string;
}

export interface SimulationOptionsFile {
    name: string;
    sourcePath: string;
    targetPath?: string;
}

export interface SimulationOptionsWindowSize {
    height: number;
    width: number;
}

export interface SimulationOptions {
    args?: SimulationOptionsArg[];
    profile?: string;
    outputDir?: string;
    headless?: boolean;
    windowSize?: SimulationOptionsWindowSize;
}
