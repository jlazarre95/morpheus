export interface SimulationOptionsWindowSize {
    height: number;
    width: number;
}

export interface SimulationOptions {
    profile?: string;
    outputDir?: string;
    headless?: boolean;
    windowSize?: SimulationOptionsWindowSize;
}
