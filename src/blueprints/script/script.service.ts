import { appendFile, mkdirp, rm } from "fs-extra";
import moment from "moment";
import { basename, resolve } from "path";
import { Dict } from "../../types";
import { BlueprintAssertion, BlueprintCorrelation, BlueprintExcludeHeader, BlueprintExcludeUrl, BlueprintFile, BlueprintLogic, BlueprintParameter } from "../models";
import { getAssertions, getCorrelations, getExcludeHeaders, getExcludeUrls, getFiles, getLogic, getParameters } from "../models/blueprint.util";
import { loadActionsFile, RecordedAction, RecordedActions } from "../simulation";
import { Har, HarEntry, HarRequest, HarResponse } from "./har";
import { Parameters } from "./parameter/parameter.util";
import { ScriptOptions } from "./script-options";
import { ScriptType } from "./script-type";
import { includeUrl } from "./util/script.util";

export type ScriptGeneratorMap = { [key: string]: ScriptGenerator<ScriptGenerationContext> };

export interface ScriptGenerator<T extends ScriptGenerationContext = ScriptGenerationContext> {
    getScriptType(): ScriptType;
    onInit?(ctx: T): Promise<void>;
    onContextChange?(ctx: T): Promise<void>;
    onStartAction?(action: RecordedAction, ctx: T): Promise<void>;
    onEndAction?(action: RecordedAction, ctx: T): Promise<void>;
    onEntry?(request: HarRequest, response: HarResponse, ctx: T): Promise<void>;
    onEnd?(ctx: T): Promise<void>;
}

export interface ScriptGenerationContext {
    timeStarted: Date;
    currEntryIndex: number;
    currActionIndex: number;
    state: ScriptState;
    prevEntry?: HarEntry;
    currEntry?: HarEntry;
    currOriginalRequest?: HarRequest;
    currRequest?: HarRequest;
    currResponse?: HarResponse;
    currReferrer?: string;
    currRedirecting?: boolean;
    currRedirected?: boolean;
}

interface ScriptState {
    scriptName: string;
    profile: string | undefined;
    outputDir: string;
    assertions: BlueprintAssertion[];
    files: BlueprintFile[];
    parameters: BlueprintParameter[];
    correlations: BlueprintCorrelation[];
    logic: BlueprintLogic[];
    excludeHeaders: BlueprintExcludeHeader[];
    excludeUrls: BlueprintExcludeUrl[];
    date: Date;
    actions: RecordedActions;
}

export async function writeContext(ctx: any) {
    await appendFile('tmp/view-pay/context.txt', `${ctx.currEntry?.request.url} -> ${JSON.stringify(ctx)}\n`);
}

export class ScriptService {

    private readonly majorSep: string = '\n========================================\n';
    private readonly minorSep: string = '\n------------------------\n';

    private readonly generators: ScriptGeneratorMap = {};

    addGenerator(generator: ScriptGenerator) {
        this.generators[generator.getScriptType()] = generator;
    }

    getAllGenerators(): ScriptGeneratorMap {
        return Object.assign({}, this.generators);
    }

    getGenerator(type: ScriptType): ScriptGenerator {
        return this.generators[type];
    }

    removeGenerator(type: ScriptType): ScriptGenerator {
        const plugin: ScriptGenerator = this.generators[type];
        delete this.generators[plugin.getScriptType()];
        return plugin;
    }

    async script(harPath: string, scriptType: ScriptType, options: ScriptOptions = {}) {
        const name: string = options.manifest?.blueprint.name || basename(harPath);
        const actions: RecordedActions = options.actionsPath ? await loadActionsFile(options.actionsPath) : { actions: [] };
        const outputDir: string = options.outputDir || resolve('.');

        await rm(outputDir, { recursive: true, force: true });
        await mkdirp(outputDir);

        const generator: ScriptGenerator = this.getGenerator(scriptType);
        if(!generator) {
            throw new Error(`No generator that supports script type '${scriptType}'`);
        }

        const parameters: BlueprintParameter[] = options.manifest ? getParameters(options.manifest, options.profile) : [];
        Parameters.setDates(parameters, new Date());

        await this.printScriptHeader(name, options);
        await this.generateScript(generator, await Har.loadHarFile(harPath), {
            scriptName: name,
            profile: options.profile,
            outputDir: outputDir,
            assertions: options.manifest ? getAssertions(options.manifest, options.profile) : [],
            files: options.manifest ? getFiles(options.manifest, options.profile, options.files) : [],
            parameters: parameters,
            correlations: options.manifest ? getCorrelations(options.manifest, options.profile) : [],
            logic: options.manifest ? getLogic(options.manifest, options.profile) : [],
            excludeHeaders: options.manifest ? getExcludeHeaders(options.manifest, options.profile): [],
            excludeUrls: options.manifest ? getExcludeUrls(options.manifest, options.profile): [],
            date: options.date || new Date(),
            actions: actions
        });
    }

    private printScriptHeader(name: string, options: ScriptOptions) {
        console.log(`${this.majorSep}Scripting ${name}...${this.majorSep}`.toUpperCase());
        // console.log(`Config: ${JSON.stringify(options)}\n`);
    }

    private async generateScript(generator: ScriptGenerator, har: Har, state: ScriptState): Promise<string> {
        const { date, excludeUrls } = state;

        const now: Date = date || new Date();
        const ctx: ScriptGenerationContext = { 
            timeStarted: now,
            currEntryIndex: -1,
            currActionIndex: -1,
            state: state
        };

        await mkdirp(ctx.state.outputDir);
        this.setTargetFiles(state.files);

        if(generator.onInit) {
            await generator.onInit(ctx);
        }
        
        const entries: HarEntry[] = har.log.entries;
        for(const entry of entries) {
            ctx.currEntryIndex++;
            if(includeUrl(entry.request, excludeUrls)) {
                ctx.currEntry = entry;
                ctx.currOriginalRequest = entry.request;
                ctx.currRequest = entry.request;
                ctx.currResponse = entry.response;
                ctx.currReferrer = Har.getHeaderValue("Referer", entry.request.headers);
                ctx.currRedirecting = ctx.currResponse.status === 302;
                ctx.currRedirected = ctx.prevEntry && ctx.prevEntry.response.status === 302;
                // await writeContext(ctx)

                if(generator.onContextChange) {
                    await generator.onContextChange(ctx);
                }
                await this.processActions(generator, ctx);
                if(generator.onEntry) {
                    await generator.onEntry(ctx.currRequest, ctx.currResponse, ctx);
                }
                ctx.prevEntry = ctx.currEntry;

            } else {
                // console.log(`Excluding ${entry.request.url}`);
            }
        }

        await this.processActions(generator, ctx, true);

        if(generator.onEnd) {
            await generator.onEnd(ctx);
        }

        return ctx.state.outputDir;
    }

    private async processActions(generator: ScriptGenerator, ctx: ScriptGenerationContext, ignoreDate: boolean = false) {
        const { actions } = ctx.state.actions;
        if(actions.length >= 1) {
            while(this.actionOccurred(ctx, ignoreDate)) {
                const action: RecordedAction = actions[++ctx.currActionIndex];
                if(generator.onContextChange) {
                    await generator.onContextChange(ctx);
                }
                if(action.state === "start" && generator.onStartAction) {
                    await generator.onStartAction(action, ctx);
                } else if(action.state === "end" && generator.onEndAction) {
                    await generator.onEndAction(action, ctx);
                }                
            }
        }
    }

    private actionOccurred(ctx: ScriptGenerationContext, ignoreDate: boolean): boolean {
        const actions: RecordedAction[] = ctx.state.actions.actions;
        const nextActionIndex: number = ctx.currActionIndex + 1;
        const nextAction: RecordedAction | undefined = nextActionIndex < actions.length ? actions[nextActionIndex] : undefined;
        const currRequestDate: string = ctx.currEntry!.startedDateTime;
        return !!nextAction && (ignoreDate || moment(nextAction!.date).toDate().getTime() < moment(currRequestDate).toDate().getTime()); // TODO: check
    }

    private setTargetFiles(files: BlueprintFile[]) {
        for(const f of files) {
            if(!f.targetPath) {
                f.targetPath = basename(f.sourcePath!);
            } 
        }
    }

}