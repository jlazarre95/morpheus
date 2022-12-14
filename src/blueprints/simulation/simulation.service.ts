import { isDefined } from "class-validator";
import { mkdirp, rm, writeFile } from "fs-extra";
import moment from 'moment';
import { join, resolve } from "path";
import { BlueprintAction, BlueprintCommand, BlueprintManifest, BlueprintCommandName, ConditionEvaluator } from "../models";
import { BrowserServiceFactory } from "./browser/browser-service-factory";
import { BrowserService, LaunchOptionsWindowSize } from "./browser/browser.service";
import { CommandProcessor } from "./command-processor";
import { ElementFinder } from "./element-finder";
import { RecordedActions } from "./recorded-action";
import { SimulationOptions } from "./simulation-options";
import { getNumberOfScreenshotCommands, getScreenshotName } from "./simulation.util";

interface ScreenshotsState {
    totalScreenshots: number;
    screenshotNum: number;
    orderScreenshots: boolean;
    screenshotDir: string;
}

export class SimulationService {

    private readonly majorSep: string = '\n========================================\n';
    private readonly minorSep: string = '\n------------------------\n';

    constructor(private factory: BrowserServiceFactory) {

    }

    async simulate(manifest: BlueprintManifest, options: SimulationOptions = {}) {
        // const args: Dict<string | undefined> = getArgs(manifest, options.args);
        const browser: BrowserService = this.getCommandService(manifest);
        const finder: ElementFinder = new ElementFinder(browser);
        const processor: CommandProcessor = new CommandProcessor(browser, finder);
        const evaluator: ConditionEvaluator = new ConditionEvaluator(finder);
        const outputDir: string = options.outputDir || resolve('.');

        await rm(outputDir, { recursive: true, force: true });
        await mkdirp(outputDir);

        const windowSize: LaunchOptionsWindowSize | undefined = options.windowSize ? { height: options.windowSize.height, width: options.windowSize.width } : undefined;
        this.printSimulationHeader(manifest, options);
        let recordedActions: RecordedActions | undefined = undefined;

        try {
            await browser.launch({ headless: options.headless, windowSize: windowSize });
            await browser.startHar(join(outputDir, 'archive.har'));
            recordedActions = await this.executeActions(manifest, options.profile, outputDir, { evaluator, processor });
        }  finally {
            try {
                await browser.stopHar();
                if (recordedActions) {
                    await writeFile(join(outputDir, 'actions.json'), JSON.stringify(recordedActions, null, 4));
                }
            } finally {
                await browser.close();
            }
        }
        console.log('\nDone!');
    }

    private async executeActions(manifest: BlueprintManifest, profile: string | undefined, outputDir: string, dependencies: { evaluator: ConditionEvaluator, processor: CommandProcessor }): Promise<RecordedActions> {
        const { evaluator, processor } = dependencies;

        const state: ScreenshotsState = {
            totalScreenshots: getNumberOfScreenshotCommands(manifest),
            orderScreenshots: manifest.blueprint.simulation?.config?.orderScreenshots || false,
            screenshotDir: join(outputDir, 'screenshots'),
            screenshotNum: 1,
        };

        const recordedActions: RecordedActions = { actions: [] };
        let actionNum = 0;
        
        for(const action of manifest.blueprint.simulation?.actions || []) {
            if (await this.skipAction(action, profile, evaluator)) {
                continue;
            }
            actionNum++;
            console.log(`\n${actionNum}) ${action.name}${this.minorSep}`);

            recordedActions.actions.push({ name: action.name, date: moment().toISOString(), state: 'start' });

            await processor.wait(action.waitBefore);

            let commandNum = 0;
            for (const command of action.commands || []) {
                if (await this.skipCommand(command, profile, evaluator)) {
                    continue;
                }
                commandNum++;
                console.log(`Executing command #${commandNum}: ${JSON.stringify(command)}`);
                await processor.wait(command.waitBefore);

                try {
                    await this.executeCommand(command, state, { processor });
                } catch(err: any) {
                    await this.screenshot('before-error.png', state, { safe: true, processor });
                    throw err;
                }

                const commandWaitAfter: number | undefined = isDefined(command.waitAfter) ? command.waitAfter : manifest.blueprint.simulation?.config?.commandWait;
                await processor.wait(commandWaitAfter);
            }

            const actionWaitAfter: number | undefined = isDefined(action.waitAfter) ? action.waitAfter : manifest.blueprint.simulation?.config?.actionWait;
            await processor.wait(actionWaitAfter);

            recordedActions.actions.push({ name: action.name, date: moment().toISOString(), state: 'end' });
        }

        return recordedActions;
    }

    private async executeCommand(command: BlueprintCommand, state: ScreenshotsState, dependencies: { processor: CommandProcessor }) {
        const { processor } = dependencies;
        const commandName = BlueprintCommand.getName(command);
        switch (commandName) {
            case BlueprintCommandName.$:
                await processor.find(command.$!.selector, command.$!.root, command.$!.saveAs);
                break;
            case BlueprintCommandName.clear:
                await processor.clear(command.clear!.selector.selector, command.clear!.selector.root);
                break;
            case BlueprintCommandName.click:
                await processor.click(command.click!.selector.selector, command.click!.selector.root);
                break;
            case BlueprintCommandName.close:
                await processor.close();
                break;
            case BlueprintCommandName.closePage:
                await processor.closePage();
                break;
            case BlueprintCommandName.evaluateHandle:
                await processor.evaluateHandle(command.evaluateHandle!.pageFunction, command.evaluateHandle!.root, command.evaluateHandle!.saveAs);
                break;
            case BlueprintCommandName.find:
                await processor.find(command.find!.selector, command.find!.root, command.find!.saveAs);
                break;
            case BlueprintCommandName.focus:
                await processor.focus(command.focus!.selector.selector, command.focus!.selector.root);
                break;
            case BlueprintCommandName.frame:
                await processor.frame(command.frame!);
                break;
            case BlueprintCommandName.goBack:
                await processor.goBack(command.goBack!.timeout, command.goBack!.waitUntil);
                break;
            case BlueprintCommandName.goForward:
                await processor.goForward(command.goForward!.timeout, command.goForward!.waitUntil);
                break;
            case BlueprintCommandName.goto:
                await processor.goTo(command.goto!.url);
                break;
            case BlueprintCommandName.hover:
                await processor.hover(command.hover!.selector.selector, command.hover!.selector.root);
                break;
            case BlueprintCommandName.import:
                await processor.import(command.import!.name, command.import!.ranges);
                break;
            case BlueprintCommandName.log:
                await processor.log(command.log!.message);
                break;
            case BlueprintCommandName.mainFrame:
                await processor.mainFrame();
                break;
            case BlueprintCommandName.newPage:
                await processor.newPage();
                break;
            case BlueprintCommandName.press:
                await processor.press(command.press!.key, command.press!.text, command.press!.selector?.selector, command.press!.selector?.root);
                break;
            case BlueprintCommandName.reload:
                await processor.reload(command.reload!.timeout, command.reload!.waitUntil);
                break;
            case BlueprintCommandName.screenshot:
                await this.screenshot(command.screenshot!.name, state, { processor });
                state.screenshotNum = state.screenshotNum + 1;
                break;
            case BlueprintCommandName.setCacheEnabled:
                await processor.setCacheEnabled(command.setCacheEnabled!);
                break;
            case BlueprintCommandName.setDefaultNavigationTimeout:
                await processor.setDefaultNavigationTimeout(command.setDefaultNavigationTimeout!);
                break;
            case BlueprintCommandName.setDefaultTimeout:
                await processor.setDefaultTimeout(command.setDefaultTimeout!);
                break;
            case BlueprintCommandName.setGeoLocation:
                await processor.setGeoLocation(command.setGeoLocation!.latitude, command.setGeoLocation!.longitude, command.setGeoLocation!.accuracy);
                break;
            case BlueprintCommandName.setJavascriptEnabled:
                await processor.setJavascriptEnabled(command.setJavascriptEnabled!);
                break;
            case BlueprintCommandName.setOfflineMode:
                await processor.setOfflineMode(command.setOfflineMode!);
                break;
            case BlueprintCommandName.setUserAgent:
                await processor.setUserAgent(command.setUserAgent!.userAgent);
                break;
            case BlueprintCommandName.setWindowSize:
                await processor.setWindowSize(command.setWindowSize!.width, command.setWindowSize!.height);
                break;
            case BlueprintCommandName.tap:
                await processor.tap(command.tap!.selector.selector, command.tap!.selector.root);
                break;
            case BlueprintCommandName.type:
                await processor.type(command.type!.text, command.type!.selector?.root, command.type!.selector?.root);
                break;
            case BlueprintCommandName.wait:
                await processor.wait(command.wait!);
                break;
            case BlueprintCommandName.waitForFrame:
                await processor.waitForFrame(command.waitForFrame!.urlOrPredicate);
                break;
            case BlueprintCommandName.waitForNavigation:
                await processor.waitForNavigation(command.waitForNavigation!.timeout, command.waitForNavigation!.waitUntil);
                break;
            case BlueprintCommandName.waitForNetworkIdle:
                await processor.waitForNetworkIdle(command.waitForNetworkIdle!.idleTime, command.waitForNetworkIdle!.timeout);
                break;
            case BlueprintCommandName.waitFor:
                await processor.waitFor(command.waitFor!.selector.selector, command.waitFor!.selector.root, command.waitFor!.options, command.waitFor!.saveAs);
                break;
            default:
                throw new Error(`Unsupported command: '${commandName}'. Supported commands: ${Object.values(BlueprintCommandName).join(',')}`);
        }
    }

    private printSimulationHeader(manifest: BlueprintManifest, options?: SimulationOptions) {
        console.log(`${this.majorSep}Simulating ${manifest.blueprint.name}...${this.majorSep}`.toUpperCase());
        console.log(`Config: ${JSON.stringify(options)}`);
    }

    private async skipAction(action: BlueprintAction, profile: string | undefined, evaluator: ConditionEvaluator): Promise<boolean> {
        if (action.profiles) {
            if (action.profiles.indexOf(profile!) < 0) {
                console.log(`Skipping action '${action.name}' due to profile: (current='${profile}', required='${action.profiles}')`);
                return Promise.resolve(true);
            } else {
                console.log(`Matched action profile: (profile='${profile}', action='${action.name}')`);
            }
        }
        if (action.condition) {
            console.log(`Evaluating condition for action '${action.name}': ` + JSON.stringify(action.condition));
            if (!await evaluator.evalCondition(action.condition)) {
                console.log(`False: Skipping action`);
                return Promise.resolve(true);
            }
            console.log("True");
        }
        return Promise.resolve(false);
    }
    private async skipCommand(command: BlueprintCommand, profile: string | undefined, evaluator: ConditionEvaluator): Promise<boolean> {
        if (command.profiles) {
            if (command.profiles.indexOf(profile!) < 0) {
                console.log(`Skipping command ${JSON.stringify(command)} due to profiles: (current='${profile}', required='${command.profiles}')`);
                return true;
            } else {
                console.log(`Matched command profile: (profile='${profile}'), command='${JSON.stringify(command)}'`);
            }
        }
        if (command.condition) {
            console.log(`Evaluating condition for command: ` + JSON.stringify(command.condition));
            if (!await evaluator.evalCondition(command.condition)) {
                console.log(`False: Skipping command`);
                return true;
            }
            console.log("True");
        }
        return false;
    }

    private async screenshot(name: string, state: ScreenshotsState, options: { safe?: boolean, processor: CommandProcessor }) {
        const screenshotName: string = getScreenshotName(name, state.screenshotNum, state.totalScreenshots, state.orderScreenshots);
        try {
            await options.processor.screenshot(state.screenshotDir, screenshotName);
        } catch(err) {
            if(options.safe) {
                console.error(err);
            } else {
                throw err;
            }
        }
    }

    private getCommandService(manifest: BlueprintManifest): BrowserService {
        let commandService: BrowserService;
        switch (manifest.blueprint.simulation?.type || "puppeteer") {
            case 'puppeteer':
                commandService = this.factory.puppeteer();
                break;
            default:
                throw new Error(`Unsupported simulation type: ${manifest.blueprint.simulation?.type}`);
        }
        return commandService;
    }

}