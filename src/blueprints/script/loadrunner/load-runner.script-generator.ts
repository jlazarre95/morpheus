
import { appendFile, copyFile, mkdirp, writeFile } from "fs-extra";
import { dirname, join } from "path";
import { Dict } from "../../../types";
import { RecordedAction } from "../../simulation";
import { BlueprintExcludeHeader, BlueprintRequestResponseFilter } from "../../models";
import { Correlations, CorrelationScanContext } from "../correlation/correlation.util";
import { MatchedCorrelationRule } from "../correlation/matched-correlation-rule";
import { Har, HarRequest, HarResponse } from "../har";
import { Parameters } from "../parameter/parameter.util";
import { ScriptType } from "../script-type";
import { ScriptGenerationContext, ScriptGenerator } from "../script.service";
import { DEFAULT_EXCLUDED_HEADERS } from "../util/script.util";
import { LrActionFile } from "./models/lr-action-file";
import { LrRequest } from "./models/lr-request";
import { LrRequestGroup } from "./models/lr-request-group";
import { LrThinkTime } from "./models/lr-think-time";
import { createExcludeHeaders } from "../../models/blueprint.util";
import { LrUsrFile } from "./models/lr-usr-file";
import { LrPrmFile } from "./models/lr-prm-file";
import { LrInitFile } from "./models/lr-init-file";
import { LrUspFile } from "./models/lr-usp-file";
import { LrEndFile } from "./models/lr-end-file";
import { LrConfigFile } from "./models/lr-config-file";
import { LrGlobalsFile } from "./models/lr-globals-file";
import { LrCustomBodyFile } from "./models/lr-custom-body-file";
import { getNumRecords } from "./util/lines.util";
import { copyInstance } from "../../../util/serialization.util";

export interface LrScriptGenerationContext extends ScriptGenerationContext {
    actionFile?: LrActionFile;
    currTransactions?: Set<string>;
    excludedHeaders?: BlueprintExcludeHeader[];
    indexes?: Dict<number>;
    matches?: Dict<CorrelationScanContext>;
    occurrences?: Map<BlueprintRequestResponseFilter, number>;
}

export class LoadRunnerScriptGenerator implements ScriptGenerator<LrScriptGenerationContext> {

    getScriptType(): ScriptType {
        return ScriptType.loadrunner;
    }

    async onInit(ctx: LrScriptGenerationContext): Promise<void> {
        const { excludeHeaders } = ctx.state;

        // TODO: revisit creator
        // TODO: revisit simulation args
        ctx.actionFile = new LrActionFile({
            scriptName: ctx.state.scriptName,
            // creator: 'Morpheus',
            timeGenerated: ctx.timeStarted,
            //    simulationArgs: ctx.options.simulationArgs 
        });
        ctx.currTransactions = new Set<string>();
        ctx.indexes = {};
        ctx.matches = {};
        ctx.occurrences = new Map<BlueprintRequestResponseFilter, number>();
        ctx.excludedHeaders = createExcludeHeaders(DEFAULT_EXCLUDED_HEADERS);
        ctx.excludedHeaders = ctx.excludedHeaders.concat(excludeHeaders);
    }

    async onStartAction(action: RecordedAction, ctx: LrScriptGenerationContext): Promise<void> {
        if (ctx.actionFile!.isStartTransactionAdded()) {
            ctx.actionFile!.addElement(new LrThinkTime(10));
        }
        ctx.currTransactions!.add(action.name);
        ctx.actionFile!.addStartTransaction(action.name);
    }

    async onEndAction(action: RecordedAction, ctx: LrScriptGenerationContext): Promise<void> {
        ctx.currTransactions!.delete(action.name);
        ctx.actionFile!.addEndTransaction(action.name);
    }

    async onEntry(request: HarRequest, response: HarResponse, ctx: LrScriptGenerationContext): Promise<void> {
        const isRedirectedRequest: boolean = ctx.currRedirected || false;

        const referrer: string | undefined = ctx.currReferrer;
        const requestGroup: LrRequestGroup | undefined = ctx.actionFile!.getLastRequestGroup();
        const referrerGroupUrl: string | undefined = requestGroup?.referrerGroupUrl;

        const isParentRequest: boolean = !referrer || !referrerGroupUrl || referrerGroupUrl !== referrer;

            // if(request.url.includes('Login.aspx')) {
            //     console.log(isRedirectedRequest)
            //     console.log(isParentRequest);
            //     console.log(!ctx.actionFile!.getLastRequestGroup())
            //     console.log(ctx.actionFile!.getLastRequestGroup()!.referrerGroupUrl !== ctx.currReferrer)
            //     console.log(ctx.actionFile!.getLastRequestGroup()!.referrerGroupUrl)
            //     console.log(ctx.currReferrer)
            //     console.log("\n")
            // }



        // const group = ctx.actionFile.getLastRequestGroup() ? ctx.actionFile.getLastRequestGroup().referrerGroupUrl : null;

        //await writeFile("Action.c", ctx.actionFile.toString());
        //console.log(`${ctx.currResponse.status} Parent: ${isParentRequest} In script: ${!ctx.currRedirected} \t${request.url}\tReferrer: ${ctx.currReferrer}\tGroup Referrer: ${group}\n`);

        // //console.log(request.url, isParentRequest, ctx.actionFile.getLastRequestGroup() ? ctx.actionFile.getLastRequestGroup().childRequests.length : null);

        // console.log(`${request.url} -> (redirected=${isRedirectedRequest}, parent=${isParentRequest})`);

        if (isRedirectedRequest) {
            this.handleRedirectedRequest(request, response, isParentRequest, ctx);
        } else if (isParentRequest) {
            this.generateParentRequest(request, response, ctx);
        } else {
            this.generateChildRequest(request, response, ctx);
        }
    }

    async onEnd(ctx: LrScriptGenerationContext): Promise<void> {
        const scriptName: string = ctx.state.scriptName.replace(new RegExp('\\s', 'g'), '');
        const scriptVersion: string = '12.53.0.1203';
        const transactionNames: string[] = ctx.state.actions.actions.filter(a => a.state === 'end').map(a => a.name);

        const actionFileName = "Action.c";
        const configFileName = "default.cfg";
        const globalsFileName = "globals.h";
        const uspFileName = "default.usp";
        const vUserInitFileName = "vuser_init.c";
        const vUserEndFileName = "vuser_end.c";
        const usrFileName = scriptName + '.usr';
        const prmFileName = scriptName + '.prm';
        const customBodyFileName = "lrw_custom_body.h";

        const numRecords = await getNumRecords(ctx.state.files);

        const usrFile = new LrUsrFile({ actionFileName, configFileName, globalsFileName, uspFileName, vUserInitFileName, vUserEndFileName, prmFileName, transactionNames, scriptVersion });
        const prmFile = new LrPrmFile({ files: ctx.state.files, parameters: ctx.state.parameters, numRecords });
        const vUserInitFile = new LrInitFile();
        const vUserEndFile = new LrEndFile();
        const uspFile = new LrUspFile();
        const configFile = new LrConfigFile({ uspFileName });
        const globalsFile = new LrGlobalsFile();
        const customBodyFile = new LrCustomBodyFile();

        const outputDir: string = ctx.state.outputDir;

        // Write action.c
        await writeFile(join(outputDir, "Action.c"), ctx.actionFile!.toString());

        // Write custom files
        for(const f of ctx.state.files) {
            const targetPath: string = join(outputDir, f.targetPath!);
            await mkdirp(dirname(targetPath));
            await copyFile(f.sourcePath!, targetPath);
        }

        // Write supporting files
        await writeFile(join(outputDir, usrFileName), usrFile.toString());
        await writeFile(join(outputDir, prmFileName), prmFile.toString());
        await writeFile(join(outputDir, vUserInitFileName), vUserInitFile.toString());
        await writeFile(join(outputDir, vUserEndFileName), vUserEndFile.toString());
        await writeFile(join(outputDir, uspFileName), uspFile.toString());
        await writeFile(join(outputDir, configFileName), configFile.toString());
        await writeFile(join(outputDir, globalsFileName), globalsFile.toString());
        await writeFile(join(outputDir, customBodyFileName), customBodyFile.toString());
    }

    private handleRedirectedRequest(request: HarRequest, response: HarResponse, isParentRequest: boolean, ctx: LrScriptGenerationContext) {
        if (ctx.currRedirecting) {
            ctx.actionFile!.getLastRequestGroup()!.referrerGroupUrl = request.url;
        } else {
            // Get the originating request that redirected to this current request.
            const originatingRequest: LrRequest = isParentRequest ? ctx.actionFile!.getLastRequestGroup()!.parentRequest! :
                ctx.actionFile!.getLastRequestGroup()!.getLastChildRequest()!;

            // if(request.url.includes('Login.aspx')) {
            //     console.log(isParentRequest)
            //     console.log(originatingRequest)
            //     // console.log(ctx.currRequest);
            // }


            // Scan the response for correlations and text checks.
            const matchedScans: boolean = this.scan(response, originatingRequest, ctx);

            //if(matchedScans)
            //console.log("------------Got correlations!------------");

            if (matchedScans && !isParentRequest) {
                // The current request is a child, is the result of a redirect, and has matched correlations and/or text
                // checks. We need to pull the original request (which is also a child) out of the web_concurrent block
                // and make it a new "parent" request. The child request will not be placed in the script (b/c it is a
                // redirect), so no further action on it will take place. Following child requests will be resumed in
                // another web_concurrent block after the new "parent" request in the script.

                // Remove "parent" request from web_concurrent block.
                const parentRequest: LrRequest | undefined = ctx.actionFile!.getLastRequestGroup()!.removeLastChildRequest();
                if (originatingRequest !== parentRequest) {
                    throw new Error("Originating request does not equal parent request");
                }

                // Add "parent" request to new request group.
                const requestGroup: LrRequestGroup = new LrRequestGroup(originatingRequest);
                ctx.actionFile!.addRequestGroup(requestGroup);

                // Set request group referrer URL as the referrer of the current child request.
                requestGroup.referrerGroupUrl = ctx.currReferrer;
            } else {
                ctx.actionFile!.getLastRequestGroup()!.referrerGroupUrl = request.url;
            }
        }
    }

    private generateParentRequest(request: HarRequest, response: HarResponse, ctx: LrScriptGenerationContext) {
        this.parameterize(request, response, ctx);
        const parentRequest: LrRequest = new LrRequest(request, response, ctx.currEntryIndex, ctx.excludedHeaders);
        this.scan(response, parentRequest, ctx);
        const requestGroup: LrRequestGroup = new LrRequestGroup(parentRequest);
        ctx.actionFile!.addRequestGroup(requestGroup);
    }

    private generateChildRequest(request: HarRequest, response: HarResponse, ctx: LrScriptGenerationContext) {
        this.parameterize(request, response, ctx);
        const childRequest: LrRequest = new LrRequest(request, response, ctx.currEntryIndex, ctx.excludedHeaders);
        this.scan(response, childRequest, ctx);
        if (childRequest.getMatchedCorrelations().length < 1) {
            //console.log("NO correlations");
            // This is a request with no correlations, so add as a child request to the current group.
            ctx.actionFile!.getLastRequestGroup()!.childRequests.push(childRequest);
        } else {
            //console.log("Correlations");
            //console.log(childRequest.getMatchedCorrelations());
            // This is a request with correlations, so add a new LRConcurrentRequestGroup and set it to the parent.
            const requestGroup: LrRequestGroup = new LrRequestGroup(childRequest);
            requestGroup.referrerGroupUrl = ctx.currReferrer;
            ctx.actionFile!.addRequestGroup(requestGroup);
        }
    }

    private parameterize(request: HarRequest, response: HarResponse, ctx: LrScriptGenerationContext) {
        const actions: string[] = Array.from(ctx.currTransactions!);
        const originalRequest: HarRequest = copyInstance(HarRequest, request);
        const occurrences = ctx.occurrences;
        Parameters.substitute(request, response, ctx.state.parameters, { originalRequest, actions, occurrences });
        Correlations.substitute(request, response, { originalRequest, actions, occurrences, matches: ctx.matches! });
    }

    private scan(response: HarResponse, request: LrRequest, ctx: LrScriptGenerationContext): boolean {
        const matchedCorrelations: MatchedCorrelationRule[] = Correlations.scan(response, ctx.state.correlations,
            { indexes: ctx.indexes!, matches: ctx.matches! });
        request.addMatchedCorrelations(...matchedCorrelations);
        return matchedCorrelations.length >= 1;
    }

}