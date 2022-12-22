import { isDefined } from "class-validator";
import { Range } from "../../util";
import { PressableKey, WaitUntilState } from "../simulation";
import { BlueprintCommandName } from "./blueprint-command-name";

export enum BlueprintCorrelationScope {
    headers = "headers",
    body = "body",
    all = "all"
}

export interface BlueprintSelector {
    root?: string;
    selector: string;

    // constructor(selector: string, root?: string) {
    //     this.selector = selector!;
    //     this.root = root;
    // }
}

export enum SimulationConditionName {
    selector = 'selector',
    waitFor = 'waitFor',
    and = 'and',
    or = 'or',
    not = 'not',
    xor = 'xor',
}

export interface BlueprintWaitFor {
    selector: BlueprintSelector;
    options?: BlueprintWaitForSelectorOptions;
}

export interface BlueprintSimulationCondition {
    and?: BlueprintSimulationCondition[];
    or?: BlueprintSimulationCondition[];

    not?: BlueprintSimulationCondition;

    xor?: BlueprintSimulationCondition[];

    selector?: BlueprintSelector;

    waitFor?: BlueprintWaitFor;


}

export namespace BlueprintSimulationCondition {
    export function getName(condition: BlueprintSimulationCondition): SimulationConditionName | undefined {
        const keys: string[] = Object.keys(condition);
        for (const key of keys) {
            if (key in SimulationConditionName) {
                return <SimulationConditionName>key;
            }
        }
        return undefined;
    }
}

export interface BlueprintXPath {
    root?: string;

    xPath: string;

    // constructor(xPath: string, root?: string) {
    //     this.xPath = xPath!;
    //     this.root = root;
    // }
}

export interface BlueprintExcludeHeader {
    header: string;

    url?: string;

    profiles?: string[];

    // constructor(header: string) {
    //     this.header = header;
    // }
}

export interface BlueprintExcludeUrl {
    url: string;

    profiles?: string[];

    // constructor(url: string) {
    //     this.url = url;
    // }
}

export interface BlueprintLoop {
    url: string;

    method?: string;

    iterations?: number;

    condition?: string;

    action?: string;

    excludeUrl?: string;

    start?: number;

    end?: number;
}

export interface BlueprintLogic {
    type: string;

    loop?: BlueprintLoop;

    profiles?: string[];
}

export interface BlueprintRegex {
    pattern: string;

    group?: number;

    // constructor(pattern: string) {
    //     this.pattern = pattern;
    // }
}

export interface BlueprintBoundaryLeft {
    boundary: string;

    ignoreCase?: boolean;

    // constructor(boundary: string) {
    //     this.boundary = boundary;
    // }
}

export interface BlueprintBoundaryRight {
    boundary: string;

    ignoreCase?: boolean;

    // constructor(boundary: string) {
    //     this.boundary = boundary;
    // }
}

export interface BlueprintBoundary {
    left?: BlueprintBoundaryLeft;

    right?: BlueprintBoundaryRight;
}

export interface BlueprintJson {
    path?: string;

    // constructor(path: string) {
    //     this.path = path;
    // }
}

export enum BlueprintCorrelationType {
    boundary = 'boundary',
    json = 'json',
    regex = 'regex',
}

export interface BlueprintCorrelation {
    name: string;

    import?: string;

    boundary?: BlueprintBoundary;

    json?: BlueprintJson;

    regex?: BlueprintRegex;

    all?: boolean;

    last?: boolean;

    ordinal?: number;

    scope?: BlueprintCorrelationScope;

    url?: string;

    replaceFilters?: BlueprintReplaceFilter[];

    profiles?: string[];

}

export namespace BlueprintCorrelation {
    export function getType(correlation: BlueprintCorrelation): BlueprintCorrelationType | undefined {
        const keys: string[] = Object.keys(correlation);
        for (const key of keys) {
            if (key in BlueprintCorrelationType) {
                return <BlueprintCorrelationType>key;
            }
        }
        return undefined;
    }
}

export enum BlueprintParameterUpdateValueOn {
    iteration = 'iteration',
    occurrence = 'occurrence',
    once = 'once',
}

export enum BlueprintParameterSelectNextRow {
    sequential = 'sequential',
    random = 'random',
    unique = 'unique',
}

export enum BlueprintParameterWhenOutOfValues {
    none = 'none',
    abortUser = 'abortUser',
    cycle = 'cycle',
    repeatLast = 'repeatLast',
}

export interface BlueprintParameterFile {
    name: string;
    column?: string;
    delimiter?: string;
    sameLineAs?: string;
    firstDataLine?: number;
    selectNextRow?: BlueprintParameterSelectNextRow;
    whenOutOfValues?: BlueprintParameterWhenOutOfValues;
}

export interface BlueprintParameterDate {    
    format: string;
    offset?: number;
    workingDays?: boolean;
}

export enum BlueprintParameterType {
    // replace = 'replace',
    date = 'date',
    file = 'file'
}

export namespace BlueprintParameter {
    export function getType(param: BlueprintParameter): BlueprintParameterType | undefined {
        // if(param.file) {
        //     return BlueprintParameterType.file;
        // }
        // if(param.date) {
        //     return BlueprintParameterType.date;
        // }
        // return BlueprintParameterType.replace;
        const keys: string[] = Object.keys(param);
        for(const key of keys) {
            if(key in BlueprintParameterType && isDefined(param[<BlueprintParameterType> key])) {
                return <BlueprintParameterType> key;
            }
        }
        return undefined;
    }
}

export enum BlueprintReplaceFilterScope {
    all = 'all',
    url = 'url',
    body = 'body',
    headers = 'headers'
}

export enum BlueprintRequestResponseFilterTarget {
    all = 'all',
    request = 'request',
    response = 'response',
}

export enum BlueprintHttpMethod {
    head = 'head',
    get = 'get',
    put = 'put',
    post = 'post',
    patch = 'patch',
    delete = 'delete',
    options = 'options',
}
export interface BlueprintDate {
    // date?: string;
    format: string;
}

export interface BlueprintUrlFilter {
    exclude?: boolean;
    url: string;
    regex?: boolean;
}

export interface BlueprintHeadersFilter {
    exclude?: boolean;
    headers: string;
    regex?: boolean;
}

export interface BlueprintBodyFilter {
    exclude?: boolean;
    body: string;
    regex?: boolean;
}


export interface BlueprintActionFilter {
    exclude?: boolean;
    action: string;
    regex?: boolean;
}

export interface BlueprintRange {
    exclude?: boolean;
    from: number;
    to?: number;
}

export interface BlueprintHttpMethodFilter {
    exclude?: boolean;
    method: (BlueprintHttpMethod | string);
}

export interface BlueprintRequestResponseFilter {
    target?: BlueprintRequestResponseFilterTarget;
    method?: BlueprintHttpMethodFilter[];
    url?: BlueprintUrlFilter;
    headers?: BlueprintHeadersFilter;
    body?: BlueprintBodyFilter;
    action?: BlueprintActionFilter;
    status?: BlueprintRange[];
    occurrences?: BlueprintRange[];
}

export interface BlueprintReplaceFilter {
    ignoreCase?: boolean;
    boundary?: BlueprintBoundary;
    scope?: BlueprintReplaceFilterScope;
    occurrences?: BlueprintRange[];
    requestResponse?: BlueprintRequestResponseFilter;
}

export interface BlueprintReplace {
    text?: string;
    date?: BlueprintDate; 
    ignoreCase?: boolean;
    filters?: BlueprintReplaceFilter[];
}

export interface BlueprintParameter {
    name: string;
    replace?: BlueprintReplace[];
    file?: BlueprintParameterFile;
    date?: BlueprintParameterDate;
    updateValueOn?: BlueprintParameterUpdateValueOn;
    profiles?: string[];
    // constructor(name: string, replace: string) {
    //     this.name = name;
    //     this.replace = replace;
    // }
}

export interface BlueprintFile {
    name: string;
    sourcePath?: string;
    targetPath?: string;
    profiles?: string[];
}

export interface BlueprintAssertion {
    name?: string;
    text: string;
    profiles?: string[];

    // constructor(text: string, name?: string) {
    //     this.text = text;
    //     this.name = name;
    // }
}

export interface BlueprintScript {
    assertions?: BlueprintAssertion[];
    files?: BlueprintFile[];
    parameters?: BlueprintParameter[];
    correlations?: BlueprintCorrelation[];
    logic?: BlueprintLogic[];
    excludeHeaders?: BlueprintExcludeHeader[];
    excludeUrls?: BlueprintExcludeUrl[];
}

export interface BlueprintImportRange {
    from: number;
    to?: number;

    // constructor(from: number, to?: number) {
    //     this.from = from;
    //     this.to = to;
    // }
}
export interface BlueprintSetWindowSizeCommand {

    width: number;

    height: number;

    // constructor(width: number, height: number) {
    //     this.width = width;
    //     this.height = height;
    // }


}

export interface BlueprintTypeCommand {
    text: string;

    selector?: BlueprintSelector;

}

export interface BlueprintImportCommand {
    name: string;

    ranges?: BlueprintImportRange[];

    // constructor(name: string, ranges?: BlueprintImportRange[]) {
    //     this.name = name;
    //     this.ranges = ranges;
    // }


}

export interface BlueprintFindCommand {

    selector: string;

    saveAs?: string;

    root?: string;

    // constructor(selector: string) {
    //     this.selector = selector;
    // }
}

export interface BlueprintClickCommand {
    selector: BlueprintSelector;

}


export interface BlueprintClearCommand {
    selector: BlueprintSelector;

}

export interface BlueprintTapCommand {
    selector: BlueprintSelector;

}

export interface BlueprintGoToCommand {
    url: string;

    // constructor(url: string) {
    //     this.url = url;
    // }
}

export interface BlueprintNewPageCommand { }
export interface BlueprintCloseCommand { }
export interface BlueprintClosePageCommand { }

export interface BlueprintLogCommand {
    message: string;

    // constructor(message: string) {
    //     this.message = message;
    // }
}

export interface BlueprintScreenshotCommand {
    name: string; // TODO: validate file extension and is a file name not a path

    // constructor(name: string) {
    //     this.name = name;
    // }
}

export interface BlueprintPressCommand {
    key: PressableKey;

    selector?: BlueprintSelector;

    text?: string;

}


export interface BlueprintGoBackCommand {
    timeout?: number;

    waitUntil?: WaitUntilState[];

    // constructor(timeout?: number) {
    //     this.timeout = timeout;
    // }
}

export interface BlueprintGoForwardCommand {
    timeout?: number;

    waitUntil?: WaitUntilState[];

    // constructor(timeout?: number) {
    //     this.timeout = timeout;
    // }
}

export interface BlueprintHoverCommand {
    selector: BlueprintSelector;

}

export interface BlueprintReloadCommand {
    timeout?: number;

    waitUntil?: WaitUntilState[];

    // constructor(timeout?: number) {
    //     this.timeout = timeout;
    // }
}

export interface BlueprintSetGeoLocationCommand {
    latitude: number;

    longitude: number;

    accuracy?: number;

    // constructor(latitude: number, longitude: number) {
    //     this.latitude = latitude;
    //     this.longitude = longitude;
    // }

}

export interface BlueprintSetUserAgentCommand {
    userAgent: string;

    // constructor(userAgent: string) {
    //     this.userAgent = userAgent;
    // }
}

export interface BlueprintWaitForFrameCommand {
    urlOrPredicate: string;

    // constructor(urlOrPredicate: string) {
    //     this.urlOrPredicate = urlOrPredicate;
    // }
}

export interface BlueprintWaitForNavigationCommand {
    timeout?: number;

    waitUntil?: WaitUntilState[];
}

export interface BlueprintWaitForNetworkIdleCommand {
    idleTime?: number;

    timeout?: number;

    // constructor(idleTime?: number) {
    //     this.idleTime = idleTime;
    // }
}

export interface BlueprintWaitForSelectorOptions {
    visible?: boolean;

    hidden?: boolean;

    timeout?: number;
}

export interface BlueprintWaitForCommand {
    selector: BlueprintSelector;

    saveAs?: string;

    options?: BlueprintWaitForSelectorOptions;
}

export interface BlueprintFocusCommand {
    selector: BlueprintSelector;
}

export interface BlueprintMainFrameCommand {

}

export interface BlueprintEvaluateHandleCommand {
    pageFunction: string;

    root?: string;

    saveAs?: string;

    // constructor(pageFunction: string) {
    //     this.pageFunction = pageFunction;
    // }
}

export interface BlueprintCommand {
    $?: BlueprintFindCommand;
    clear?: BlueprintClearCommand;
    click?: BlueprintClickCommand;
    close?: BlueprintCloseCommand;
    closePage?: BlueprintClosePageCommand;
    evaluateHandle?: BlueprintEvaluateHandleCommand;
    find?: BlueprintFindCommand;
    focus?: BlueprintFocusCommand;
    frame?: string | number;
    goBack?: BlueprintGoBackCommand;
    goForward?: BlueprintGoForwardCommand;
    goto?: BlueprintGoToCommand;
    hover?: BlueprintHoverCommand;
    import?: BlueprintImportCommand;
    log?: BlueprintLogCommand;
    mainFrame?: BlueprintMainFrameCommand;
    newPage?: BlueprintNewPageCommand;
    press?: BlueprintPressCommand;
    reload?: BlueprintReloadCommand;
    screenshot?: BlueprintScreenshotCommand;
    setCacheEnabled?: boolean;
    setDefaultNavigationTimeout?: number;
    setDefaultTimeout?: number;
    setGeoLocation?: BlueprintSetGeoLocationCommand;
    setJavascriptEnabled?: boolean;
    setOfflineMode?: boolean;
    setUserAgent?: BlueprintSetUserAgentCommand;
    setWindowSize?: BlueprintSetWindowSizeCommand;
    tap?: BlueprintTapCommand;
    type?: BlueprintTypeCommand;
    wait?: number;
    waitForFrame?: BlueprintWaitForFrameCommand;
    waitForNavigation?: BlueprintWaitForNavigationCommand;
    waitForNetworkIdle?: BlueprintWaitForNetworkIdleCommand;
    waitFor?: BlueprintWaitForCommand;
    waitBefore?: number;
    waitAfter?: number;
    condition?: BlueprintSimulationCondition;
    profiles?: string[];
}

export namespace BlueprintCommand {
    export function getName(command: BlueprintCommand): BlueprintCommandName | undefined {
        const keys: string[] = Object.keys(command);
        for (const key of keys) {
            if (key in BlueprintCommandName) {
                return <BlueprintCommandName>key;
            }
        }
        return undefined;
    }
}

export interface BlueprintAction {
    name: string;
    commands?: BlueprintCommand[];
    waitBefore?: number;
    waitAfter?: number;
    condition?: BlueprintSimulationCondition;
    profiles?: string[];

    // constructor(name: string) {
    //     this.name = name;
    //     this.commands = [];
    // }
}

export interface BlueprintArgument {
    defaultValue?: string;
    optional?: boolean;

    // constructor(defaultValue: string, optional?: boolean) {
    //     this.defaultValue = defaultValue;
    //     this.optional = optional;
    // }
}

export interface BlueprintSimulationConfig {
    actionWait?: number;
    actionPrefix?: string;
    commandWait?: number;
    orderScreenshots?: boolean;
}

export interface BlueprintSimulation {
    config?: BlueprintSimulationConfig;
    type?: 'puppeteer';
    actions: BlueprintAction[];
}

export interface BlueprintProfileSimulation {
    config?: BlueprintSimulationConfig;
}

export interface BlueprintProfile {
    args?: Map<string, BlueprintArgument>;
    simulation?: BlueprintProfileSimulation;
    script?: BlueprintScript;
}

export interface Blueprint {
    name: string;
    args?: Map<string, BlueprintArgument>;
    simulation?: BlueprintSimulation;
    script?: BlueprintScript;
    profiles?: Map<string, BlueprintProfile>;
}

export interface BlueprintManifest {
    version: string;
    blueprint: Blueprint;
}