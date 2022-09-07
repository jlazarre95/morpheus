import { Type, Transform, Exclude } from "class-transformer";
import { IsNumber, Min, IsString, IsOptional, IsNotEmpty, ValidateNested, ArrayMinSize, IsBoolean, isNotEmpty, isDefined, IsIn, IsInstance, ValidateIf } from "class-validator";
import { stringsToRanges } from "../../../util";
import { IsDefinedXor, IsTypeOf, IsOfType, Ensure, IsDefinedOr, IsGte } from "../../../validation";
import { PressableKey, WaitUntilState } from "../../simulation";
import { BlueprintCorrelation, BlueprintCorrelationScope, BlueprintManifest, BlueprintParameter, BlueprintParameterSelectNextRow, BlueprintParameterUpdateValueOn, BlueprintParameterWhenOutOfValues, BlueprintProfile } from "../blueprint";
import { BlueprintCommandName } from "../blueprint-command-name";
import { getBlueprintV1Selector } from "./blueprint.util";
import { IsBlueprintV1Selector, IsBlueprintV1WaitForTimeout, IsBlueprintV1WaitForWaitUntil, TransformToInt, IsBlueprintV1Profiles, TransformArray, TransformToArgs, TransformToBoolean } from "./blueprint.validators";

export class BlueprintV1Selector {
    @IsString()
    @IsNotEmpty()
    @IsOptional()
    root?: string;

    @IsString()
    @IsNotEmpty()
    selector: string;

    constructor(selector: string, root?: string) {
        this.selector = selector!;
        this.root = root;
    }
}

export class BlueprintV1XPath {
    @IsString()
    @IsNotEmpty()
    @IsOptional()
    root?: string;

    @IsString()
    @IsNotEmpty()
    xPath: string;

    constructor(xPath: string, root?: string) {
        this.xPath = xPath!;
        this.root = root;
    }
}

export class BlueprintV1SetWindowSizeCommand {
    @IsNumber()
    @Min(0)
    width: number;

    @IsNumber()
    @Min(0)
    height: number;

    constructor(width: number, height: number) {
        this.width = width;
        this.height = height;
    }

    static fromShorthand(cmd: string): BlueprintV1SetWindowSizeCommand {
        const tokens: string[] = cmd.split('x');
        return new BlueprintV1SetWindowSizeCommand(parseInt(tokens[0]), parseInt(tokens[1]));
    }
}

export class BlueprintV1TypeCommand {
    @IsString()
    text: string;

    @IsBlueprintV1Selector()
    @IsOptional()
    selector?: BlueprintV1Selector;

    constructor(text: string, selector?: string | BlueprintV1Selector) {
        this.text = text;
        this.selector = getBlueprintV1Selector(selector)!;
    }

    static fromShorthand(cmd: string): BlueprintV1TypeCommand {
        if (cmd.indexOf('->') >= 0) {
            const tokens: string[] = cmd.split('->');
            for (let i = 0; i < tokens.length; i++) {
                tokens[i] = tokens[i].trim();
            }
            return new BlueprintV1TypeCommand(tokens[0], tokens[1]);
        } else {
            return new BlueprintV1TypeCommand(cmd);
        }
    }
}

export class BlueprintV1ImportCommand {
    @IsString()
    @IsNotEmpty()
    name: string;

    @ValidateNested({ each: true })
    @Type(() => BlueprintV1ImportRange)
    @Transform(({ value }) => typeof value === 'string' ? BlueprintV1ImportCommand.fromShorthand(value) : value)
    @ArrayMinSize(1)
    @IsOptional()
    ranges?: BlueprintV1ImportRange[];

    constructor(name: string, ranges?: BlueprintV1ImportRange[]) {
        this.name = name;
        this.ranges = ranges;
    }

    static fromShorthand(cmd: string): BlueprintV1ImportCommand {
        if (cmd.indexOf('@') < 0) {
            return new BlueprintV1ImportCommand(cmd);
        } 
        let name: string = cmd;
        let ranges: string[] = [];
        const tokens: string[] = cmd.split('@');
        name = tokens[0];
        ranges = tokens[1].split(',');
        const importRangesArr: BlueprintV1ImportRange[] = [];
        stringsToRanges(ranges).forEach(r => importRangesArr.push(new BlueprintV1ImportRange(r.from, r.to)));
        return new BlueprintV1ImportCommand(name, importRangesArr);
    }
}

export class BlueprintV1FindCommand {
    @IsString()
    @IsNotEmpty()
    selector: string;

    @IsString()
    @IsNotEmpty()
    @IsOptional()
    saveAs?: string;

    @IsString()
    @IsNotEmpty()
    @IsOptional()
    root?: string;

    constructor(selector: string) {
        this.selector = selector;
    }
}

export class BlueprintV1ClickCommand {
    @IsBlueprintV1Selector()
    selector: BlueprintV1Selector;

    constructor(selector: string | BlueprintV1Selector) {
        this.selector = getBlueprintV1Selector(selector)!;
    }
}


export class BlueprintV1ClearCommand {
    @IsBlueprintV1Selector()
    selector: BlueprintV1Selector;

    constructor(selector: string | BlueprintV1Selector) {
        this.selector = getBlueprintV1Selector(selector)!;
    }
}

export class BlueprintV1TapCommand {
    @IsBlueprintV1Selector()
    selector: BlueprintV1Selector;

    constructor(selector: string | BlueprintV1Selector) {
        this.selector = getBlueprintV1Selector(selector)!;
    }
}

export class BlueprintV1GoToCommand {
    @IsString()
    @IsNotEmpty()
    url: string;

    constructor(url: string) {
        this.url = url;
    }
}

export class BlueprintV1NewPageCommand { }
export class BlueprintV1CloseCommand { }
export class BlueprintV1ClosePageCommand { }

export class BlueprintV1LogCommand {
    @IsString()
    message: string;

    constructor(message: string) {
        this.message = message;
    }
}

export class BlueprintV1ScreenshotCommand {
    @IsString()
    name: string; // TODO: validate file extension and is a file name not a path

    constructor(name: string) {
        this.name = name;
    }
}

export class BlueprintV1PressCommand {
    @IsString()
    key: PressableKey;

    @IsBlueprintV1Selector()
    @IsOptional()
    selector?: BlueprintV1Selector;

    @IsString()
    @IsOptional()
    text?: string;

    constructor(key: PressableKey, selector?: string | BlueprintV1Selector) {
        this.key = key;
        this.selector = getBlueprintV1Selector(selector);
    }

    static fromShorthand(cmd: string): BlueprintV1PressCommand {
        if (cmd.indexOf('->') >= 0) {
            const tokens: string[] = cmd.split('->');
            for (let i = 0; i < tokens.length; i++) {
                tokens[i] = tokens[i].trim();
            }
            return new BlueprintV1PressCommand(tokens[0], tokens[1]);
        } else {
            return new BlueprintV1PressCommand(cmd);
        }
    }
}


export class BlueprintV1GoBackCommand {
    @IsBlueprintV1WaitForTimeout()
    timeout?: number;

    @IsBlueprintV1WaitForWaitUntil()
    waitUntil?: WaitUntilState[];

    constructor(timeout?: number) {
        this.timeout = timeout;
    }
}

export class BlueprintV1GoForwardCommand {
    @IsBlueprintV1WaitForTimeout()
    timeout?: number;

    @IsBlueprintV1WaitForWaitUntil()
    waitUntil?: WaitUntilState[];

    constructor(timeout?: number) {
        this.timeout = timeout;
    }
}

export class BlueprintV1HoverCommand {
    @IsBlueprintV1Selector()
    selector: BlueprintV1Selector;

    constructor(selector: string | BlueprintV1Selector) {
        this.selector = getBlueprintV1Selector(selector)!;
    }
}

export class BlueprintV1ReloadCommand {
    @IsBlueprintV1WaitForTimeout()
    timeout?: number;

    @IsBlueprintV1WaitForWaitUntil()
    waitUntil?: WaitUntilState[];

    constructor(timeout?: number) {
        this.timeout = timeout;
    }
}

export class BlueprintV1SetGeoLocationCommand {
    @IsNumber()
    latitude: number;

    @IsNumber()
    longitude: number;

    @IsNumber()
    @IsOptional()
    accuracy?: number;

    constructor(latitude: number, longitude: number) {
        this.latitude = latitude;
        this.longitude = longitude;
    }

    static fromShorthand(shorthand: string): BlueprintV1SetGeoLocationCommand {
        const tokens = shorthand.split(',');
        return new BlueprintV1SetGeoLocationCommand(parseFloat(tokens[0]), parseFloat(tokens[1]));
    }
}

export class BlueprintV1SetUserAgentCommand {
    @IsString()
    userAgent: string;

    constructor(userAgent: string) {
        this.userAgent = userAgent;
    }
}

export class BlueprintV1WaitForFrameCommand {
    @IsString()
    urlOrPredicate: string;

    constructor(urlOrPredicate: string) {
        this.urlOrPredicate = urlOrPredicate;
    }
}

export class BlueprintV1WaitForNavigationCommand {
    @IsBlueprintV1WaitForTimeout()
    timeout?: number;

    @IsBlueprintV1WaitForWaitUntil()
    waitUntil?: WaitUntilState[];

    constructor(timeout?: number) {
        this.timeout = timeout;
    }
}

export class BlueprintV1WaitForNetworkIdleCommand {
    @IsNumber()
    @Min(0)
    @IsOptional()
    idleTime?: number;

    @IsNumber()
    @Min(0)
    @IsOptional()
    timeout?: number;

    constructor(idleTime?: number) {
        this.idleTime = idleTime;
    }
}

export class BlueprintV1WaitForSelectorOptions {
    @IsBoolean()
    @TransformToBoolean()
    @IsOptional()
    visible?: boolean;

    @IsBoolean()
    @TransformToBoolean()
    @IsOptional()
    hidden?: boolean;

    @IsNumber()
    @Min(0)
    @IsOptional()
    timeout?: number;
}

export class BlueprintV1WaitForCommand {
    @IsBlueprintV1Selector()
    selector: BlueprintV1Selector;

    @IsString()
    @IsNotEmpty()
    @IsOptional()
    saveAs?: string;

    @ValidateNested()
    @Type(() => BlueprintV1WaitForSelectorOptions)
    @IsOptional()
    options?: BlueprintV1WaitForSelectorOptions;

    constructor(selector: string | BlueprintV1Selector) {
        this.selector = getBlueprintV1Selector(selector)!;
    }
}

export class BlueprintV1FocusCommand {
    @IsBlueprintV1Selector()
    selector: BlueprintV1Selector;

    constructor(selector: string | BlueprintV1Selector) {
        this.selector = getBlueprintV1Selector(selector)!;
    }
}

export class BlueprintV1MainFrameCommand {

}

export class BlueprintV1EvaluateHandleCommand {
    @IsString()
    pageFunction: string;

    @IsString()
    @IsNotEmpty()
    @IsOptional()
    root?: string;

    @IsString()
    @IsNotEmpty()
    @IsOptional()
    saveAs?: string;

    constructor(pageFunction: string) {
        this.pageFunction = pageFunction;
    }
}

export enum SimulationConditionName {
    selector = 'selector',
    waitFor = 'waitFor',
    and = 'and',
    or = 'or',
    not = 'not',
    xor = 'xor',
}

export class BlueprintV1WaitFor {
    @IsBlueprintV1Selector()
    selector: BlueprintV1Selector;

    @ValidateNested()
    @Type(() => BlueprintV1WaitForSelectorOptions)
    @IsOptional()
    options?: BlueprintV1WaitForSelectorOptions;

    constructor(selector: string | BlueprintV1Selector) {
        this.selector = getBlueprintV1Selector(selector)!;
    }
}

export class BlueprintV1SimulationCondition {
    @IsDefinedXor(Object.keys(SimulationConditionName))
    @Exclude()
    private __topLevel: string;

    @ValidateNested({ each: true })
    @Type(() => BlueprintV1SimulationCondition)
    @IsOptional()
    and?: BlueprintV1SimulationCondition[];

    @ValidateNested({ each: true })
    @Type(() => BlueprintV1SimulationCondition)
    @IsOptional()
    or?: BlueprintV1SimulationCondition[];

    @ValidateNested()
    @Type(() => BlueprintV1SimulationCondition)
    @IsOptional()
    not?: BlueprintV1SimulationCondition;

    @ValidateNested({ each: true })
    @Type(() => BlueprintV1SimulationCondition)
    @IsOptional()
    xor?: BlueprintV1SimulationCondition[];

    @IsBlueprintV1Selector()
    @IsOptional()
    selector?: BlueprintV1Selector;

    @ValidateNested()
    @Type(() => BlueprintV1WaitFor)
    @Transform(({ value }) => typeof value === 'string' ? new BlueprintV1WaitFor(value) : value)
    @IsOptional()
    waitFor?: BlueprintV1WaitFor;

    getCondition(): SimulationConditionName | undefined {
        const keys: string[] = Object.keys(this);
        for(const key of keys) {
            if(key in SimulationConditionName) {
                return <SimulationConditionName> key;
            }
        }
        return undefined;
    }
}

export class BlueprintV1Command {
    @IsDefinedXor(Object.keys(BlueprintCommandName))
    @Exclude()
    private __topLevel: string;

    @ValidateNested()
    @Type(() => BlueprintV1FindCommand)
    @Transform(({ value }) => typeof value === 'string' ? new BlueprintV1FindCommand(value) : value)
    @IsOptional()
    $?: BlueprintV1FindCommand;

    @ValidateNested()
    @Type(() => BlueprintV1ClearCommand)
    @Transform(({ value }) => typeof value === 'string' ? new BlueprintV1ClearCommand(value) : value)
    @IsOptional()
    clear?: BlueprintV1ClearCommand;

    @ValidateNested()
    @Type(() => BlueprintV1ClickCommand)
    @Transform(({ value }) => typeof value === 'string' ? new BlueprintV1ClickCommand(value) : value)
    @IsOptional()
    click?: BlueprintV1ClickCommand;

    @ValidateNested()
    @Type(() => BlueprintV1CloseCommand)
    @IsOptional()
    close?: BlueprintV1CloseCommand;

    @ValidateNested()
    @Type(() => BlueprintV1ClosePageCommand)
    @IsOptional()
    closePage?: BlueprintV1ClosePageCommand;

    @ValidateNested()
    @Type(() => BlueprintV1EvaluateHandleCommand)
    @Transform(({ value }) => typeof value === 'string' ? new BlueprintV1EvaluateHandleCommand(value) : value)
    @IsOptional()
    evaluateHandle?: BlueprintV1EvaluateHandleCommand;

    @ValidateNested()
    @Type(() => BlueprintV1FindCommand)
    @Transform(({ value }) => typeof value === 'string' ? new BlueprintV1FindCommand(value) : value)
    @IsOptional()
    find?: BlueprintV1FindCommand;

    @ValidateNested()
    @Type(() => BlueprintV1FocusCommand)
    @Transform(({ value }) => typeof value === 'string' ? new BlueprintV1FocusCommand(value) : value)
    @IsOptional()
    focus?: BlueprintV1FocusCommand;

    @IsTypeOf(['string', 'number'])
    @IsOfType({
        type: 'string',
        validate: args => isNotEmpty(args.value),
        message: args => `${args.property} must be non-empty`
    })
    @IsOfType({
        type: 'number',
        validate: args => Ensure.isGte(args.value, 0),
        message: args => `${args.property} must be greater than or equal to 0`
    })
    @IsOptional()
    frame?: string | number;

    @ValidateNested()
    @Type(() => BlueprintV1GoBackCommand)
    @Transform(({ value }) => typeof value === 'number' ? new BlueprintV1GoBackCommand(value) : value)
    @IsOptional()
    goBack?: BlueprintV1GoBackCommand;

    @ValidateNested()
    @Type(() => BlueprintV1GoForwardCommand)
    @Transform(({ value }) => typeof value === 'number' ? new BlueprintV1GoForwardCommand(value) : value)
    @IsOptional()
    goForward?: BlueprintV1GoForwardCommand;

    @ValidateNested()
    @Type(() => BlueprintV1GoToCommand)
    @Transform(({ value }) => typeof value === 'string' ? new BlueprintV1GoToCommand(value) : value)
    @IsOptional()
    goto?: BlueprintV1GoToCommand;

    @ValidateNested()
    @Type(() => BlueprintV1HoverCommand)
    @Transform(({ value }) => typeof value === 'string' ? new BlueprintV1HoverCommand(value) : value)
    @IsOptional()
    hover?: BlueprintV1HoverCommand;

    @ValidateNested()
    @Type(() => BlueprintV1ImportCommand)
    @Transform(({ value }) => typeof value === 'string' ? BlueprintV1ImportCommand.fromShorthand(value) : value)
    @IsOptional()
    import?: BlueprintV1ImportCommand;

    @ValidateNested()
    @Type(() => BlueprintV1LogCommand)
    @Transform(({ value }) => typeof value === 'string' ? new BlueprintV1LogCommand(value) : value)
    @IsOptional()
    log?: BlueprintV1LogCommand;

    @ValidateNested()
    @Type(() => BlueprintV1MainFrameCommand)
    @IsOptional()
    mainFrame?: BlueprintV1MainFrameCommand;

    @ValidateNested()
    @Type(() => BlueprintV1NewPageCommand)
    @IsOptional()
    newPage?: BlueprintV1NewPageCommand;

    @ValidateNested()
    @Type(() => BlueprintV1PressCommand)
    @Transform(({ value }) => typeof value === 'string' ? BlueprintV1PressCommand.fromShorthand(value) : value)
    @IsOptional()
    press?: BlueprintV1PressCommand;

    @ValidateNested()
    @Type(() => BlueprintV1ReloadCommand)
    @Transform(({ value }) => typeof value === 'number' ? new BlueprintV1ReloadCommand(value) : value)
    @IsOptional()
    reload?: BlueprintV1ReloadCommand;

    @ValidateNested()
    @Type(() => BlueprintV1ScreenshotCommand)
    @Transform(({ value }) => typeof value === 'string' ? new BlueprintV1ScreenshotCommand(value) : value)
    @IsOptional()    
    screenshot?: BlueprintV1ScreenshotCommand;

    @IsBoolean()
    @TransformToBoolean()
    @IsOptional()
    setCacheEnabled?: boolean;

    @IsNumber()
    @IsOptional()
    @TransformToInt()
    setDefaultNavigationTimeout?: number;

    @IsNumber()
    @IsOptional()
    @TransformToInt()
    setDefaultTimeout?: number;

    @ValidateNested()
    @Type(() => BlueprintV1SetGeoLocationCommand)
    @Transform(({ value }) => typeof value === 'string' ? BlueprintV1SetGeoLocationCommand.fromShorthand(value) : value)
    @IsOptional()
    setGeoLocation?: BlueprintV1SetGeoLocationCommand;

    @IsBoolean()
    @TransformToBoolean()
    @IsOptional()
    setJavascriptEnabled?: boolean;

    @IsBoolean()
    @TransformToBoolean()
    @IsOptional()
    setOfflineMode?: boolean;

    @ValidateNested()
    @Type(() => BlueprintV1SetUserAgentCommand)
    @Transform(({ value }) => typeof value === 'string' ? new BlueprintV1SetUserAgentCommand(value) : value)
    @IsOptional()
    setUserAgent?: BlueprintV1SetUserAgentCommand;

    @ValidateNested()
    @Type(() => BlueprintV1SetWindowSizeCommand)
    @Transform(({ value }) => typeof value === 'string' ? BlueprintV1SetWindowSizeCommand.fromShorthand(value) : value)
    @IsOptional()
    setWindowSize?: BlueprintV1SetWindowSizeCommand;

    @ValidateNested()
    @Type(() => BlueprintV1TapCommand)
    @Transform(({ value }) => typeof value === 'string' ? new BlueprintV1TapCommand(value) : value)
    @IsOptional()
    tap?: BlueprintV1TapCommand;

    @ValidateNested()
    @Type(() => BlueprintV1TypeCommand)
    @Transform(({ value }) => typeof value === 'string' ? BlueprintV1TypeCommand.fromShorthand(value) : value)
    @IsOptional()
    type?: BlueprintV1TypeCommand;

    @IsNumber()
    @Min(0)
    @IsOptional()
    @TransformToInt()
    wait?: number;

    @ValidateNested()
    @Type(() => BlueprintV1WaitForFrameCommand)
    @Transform(({ value }) => typeof value === 'string' ? new BlueprintV1WaitForFrameCommand(value) : value)
    @IsOptional()
    waitForFrame?: BlueprintV1WaitForFrameCommand;

    @ValidateNested()
    @Type(() => BlueprintV1WaitForNavigationCommand)
    @Transform(({ value }) => !isDefined(value) || typeof value === 'number' ? new BlueprintV1WaitForNavigationCommand(value) : value)
    @IsOptional()
    waitForNavigation?: BlueprintV1WaitForNavigationCommand;

    @ValidateNested()
    @Type(() => BlueprintV1WaitForNetworkIdleCommand)
    @Transform(({ value }) => !isDefined(value) || typeof value === 'number' ? new BlueprintV1WaitForNetworkIdleCommand(value) : value)
    @IsOptional()
    waitForNetworkIdle?: BlueprintV1WaitForNetworkIdleCommand;

    @ValidateNested()
    @Type(() => BlueprintV1WaitForCommand)
    @Transform(({ value }) => typeof value === 'string' ? new BlueprintV1WaitForCommand(value) : value)
    @IsOptional()
    waitFor?: BlueprintV1WaitForCommand;

    @IsNumber()
    @Min(0)
    @IsOptional()
    @TransformToInt()
    waitBefore?: number;

    @IsNumber()
    @Min(0)
    @IsOptional()
    @TransformToInt()
    waitAfter?: number;

    @ValidateNested()
    @Type(() => BlueprintV1SimulationCondition)
    @IsOptional()
    condition?: BlueprintV1SimulationCondition;

    @IsBlueprintV1Profiles()
    @IsOptional()
    profiles?: string[];

    getCommand(): BlueprintCommandName | undefined {
        const keys: string[] = Object.keys(this);
        for(const key of keys) {
            if(key in BlueprintCommandName) {
                return <BlueprintCommandName> key;
            }
        }
        return undefined;
    }
}

export class BlueprintV1Action {
    @IsString()
    @IsNotEmpty()
    name: string;

    @ValidateNested({ each: true })
    @Type(() => BlueprintV1Command)
    @IsOptional()
    commands?: BlueprintV1Command[];

    @IsNumber()
    @Min(0)
    @IsOptional()
    @TransformToInt()
    waitBefore?: number;

    @IsNumber()
    @Min(0)
    @IsOptional()
    @TransformToInt()
    waitAfter?: number;

    @ValidateNested()
    @Type(() => BlueprintV1SimulationCondition)
    @IsOptional()
    condition?: BlueprintV1SimulationCondition;

    @IsBlueprintV1Profiles()
    @IsOptional()
    profiles?: string[];

    constructor(name: string) {
        this.name = name;
        this.commands = [];
    }
}

export class BlueprintV1SimulationConfig {
    @IsNumber()
    @Min(0)
    @IsOptional()
    @TransformToInt()
    actionWait?: number;

    @IsString()
    @IsOptional()
    actionPrefix?: string;

    @IsNumber()
    @Min(0)
    @IsOptional()
    @TransformToInt()
    commandWait?: number;

    @IsBoolean()
    @TransformToBoolean()
    @IsOptional()
    orderScreenshots?: boolean;
}

export class BlueprintV1Simulation {
    @ValidateNested()
    @Type(() => BlueprintV1SimulationConfig)
    @IsOptional()
    config?: BlueprintV1SimulationConfig;

    @IsIn(['puppeteer'])
    @IsOptional()
    type?: 'puppeteer';

    @ValidateNested({ each: true })
    @Type(() => BlueprintV1Action)
    @ArrayMinSize(1)
    actions: BlueprintV1Action[];
}




export enum BlueprintV1CorrelationScope {
    headers = "headers",
    body = "body",
    all = "all"
}

export class BlueprintV1ExcludeHeader {
    @IsString()
    @IsNotEmpty()
    header: string;

    @IsString()
    @IsNotEmpty()
    @IsOptional()
    url?: string;

    @IsBlueprintV1Profiles()
    @IsOptional()
    profiles?: string[];

    constructor(header: string) {
        this.header = header;
    }
}

export class BlueprintV1ExcludeUrl {
    @IsString()
    @IsNotEmpty()
    url: string;

    @IsBlueprintV1Profiles()
    @IsOptional()
    profiles?: string[];

    constructor(url: string) {
        this.url = url;
    }
}

export class BlueprintV1Loop {
    @IsString()
    @IsNotEmpty()
    url: string;

    @IsString()
    @IsNotEmpty()
    @IsOptional()
    method?: string;

    @IsNumber()
    @Min(1)
    @IsOptional()
    @TransformToInt()
    iterations?: number;

    @IsString()
    @IsNotEmpty()
    @IsOptional()
    condition?: string;

    @IsString()
    @IsNotEmpty()
    @IsOptional()
    action?: string;

    @IsString()
    @IsNotEmpty()
    @IsOptional()
    excludeUrl?: string;

    @IsNumber()
    @Min(1)
    @IsOptional()
    @TransformToInt()
    start?: number;

    @IsNumber()
    @Min(1)
    @IsOptional()
    @TransformToInt()
    end?: number;
}

export class BlueprintV1Logic {
    @IsString()
    @IsNotEmpty()
    type: string;

    @ValidateNested()
    @Type(() => BlueprintV1Loop)
    @IsOptional()
    loop?: BlueprintV1Loop;

    @IsBlueprintV1Profiles()
    @IsOptional()
    profiles?: string[];
}

export class BlueprintV1Regex {
    @IsString()
    @IsNotEmpty()
    pattern: string;

    @IsNumber()
    @Min(0)
    @IsOptional()
    @TransformToInt()
    group?: number;

    constructor(pattern: string) {
        this.pattern = pattern;
    }
}

export class BlueprintV1BoundaryLeft {
    @IsString()
    boundary: string;

    @IsBoolean()
    @TransformToBoolean()
    @IsOptional()
    ignoreCase?: boolean;

    constructor(boundary: string) {
        this.boundary = boundary;
    }
}

export class BlueprintV1BoundaryRight {
    @IsString()
    boundary: string;

    @IsBoolean()
    @TransformToBoolean()
    @IsOptional()
    ignoreCase?: boolean;

    constructor(boundary: string) {
        this.boundary = boundary;
    }
}

export class BlueprintV1Boundary {
    @ValidateNested()
    @Type(() => BlueprintV1BoundaryLeft)
    @Transform(({ value }) => typeof value === 'string' ? new BlueprintV1BoundaryLeft(value) : value)
    @IsOptional()
    @IsDefinedOr(['right'])
    left?: BlueprintV1BoundaryLeft;

    @ValidateNested()
    @Type(() => BlueprintV1BoundaryRight)
    @Transform(({ value }) => typeof value === 'string' ? new BlueprintV1BoundaryRight(value) : value)
    @IsOptional()
    right?: BlueprintV1BoundaryRight;
}

export class BlueprintV1Json {
    @IsString()
    @IsNotEmpty()
    @IsOptional()
    path?: string;

    constructor(path: string) {
        this.path = path;
    }
}

export enum BlueprintV1CorrelationType {
    boundary = 'boundary',
    json = 'json',
    regex = 'regex',
}

export class BlueprintV1Correlation {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsNotEmpty()
    @IsOptional()
    import?: string;

    @ValidateNested()
    @Type(() => BlueprintV1Boundary)
    @IsOptional()
    boundary?: BlueprintV1Boundary;

    @ValidateNested()
    @Type(() => BlueprintV1Json)
    @Transform(({ value }) => typeof value === 'string' ? new BlueprintV1Json(value) : value)
    @IsOptional()
    json?: BlueprintV1Json;

    @ValidateNested()
    @Type(() => BlueprintV1Regex)
    @Transform(({ value }) => typeof value === 'string' ? new BlueprintV1Regex(value) : value)
    @IsOptional()
    regex?: BlueprintV1Regex;

    @IsBoolean()
    @TransformToBoolean()
    @IsOptional()
    all?: boolean;

    @IsBoolean()
    @TransformToBoolean()
    @IsOptional()
    last?: boolean;

    @IsNumber()
    @Min(0)
    @TransformToInt()
    @IsOptional()
    ordinal?: number;

    @IsIn(Object.keys(BlueprintV1CorrelationScope))
    @IsOptional()
    scope?: BlueprintV1CorrelationScope;

    @IsString()
    @IsNotEmpty()
    @IsOptional()
    requestUrl?: string;

    @IsBlueprintV1Profiles()
    @IsOptional()
    profiles?: string[];

    getType(): BlueprintV1CorrelationType | undefined {
        const keys: string[] = Object.keys(this);
        for(const key of keys) {
            if(key in BlueprintV1CorrelationType) {
                return <BlueprintV1CorrelationType> key;
            }
        }
        return undefined;
    }

    getCorrelation(): BlueprintCorrelation {
        return {
            name: this.name,
            import: this.import,
            boundary: this.boundary,
            json: this.json,
            regex: this.regex,
            all: this.all,
            last: this.last,
            ordinal: this.ordinal,
            scope: this.getCorrelationScope(),
            requestUrl: this.requestUrl,
        };
    }

    getCorrelationScope(): BlueprintCorrelationScope {
        switch(this.scope) {
            case BlueprintV1CorrelationScope.all:
                return BlueprintCorrelationScope.all;
            case BlueprintV1CorrelationScope.headers:
                return BlueprintCorrelationScope.headers;
            case BlueprintV1CorrelationScope.body:
                return BlueprintCorrelationScope.all;
            default:
                throw new Error(`Unsupported correlation scope: ${this.scope}`);
        }
    }
}

export enum BlueprintV1ParameterUpdateValueOn {
    iteration = 'iteration',
    occurrence = 'occurrence',
    once = 'once',
}

export enum BlueprintV1ParameterSelectNextRow {
    sequential = 'sequential',
    random = 'random',
    unique = 'unique',
}

export enum BlueprintV1ParameterWhenOutOfValues {
    none = 'none',
    abortUser = 'abortUser',
    cycle = 'cycle',
    repeatLast = 'repeatLast',
}

export class BlueprintV1ParameterFile {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsNotEmpty()
    @IsOptional()
    column?: string;

    @IsString()
    @IsNotEmpty()
    @IsOptional()
    delimiter?: string;

    @IsString()
    @IsNotEmpty()
    @IsOptional()
    sameLineAs?: string;

    @IsNumber()
    @TransformToInt()
    @Min(1)
    @IsOptional()
    firstDataLine?: number;

    @IsIn(Object.keys(BlueprintV1ParameterSelectNextRow))
    @IsOptional()
    selectNextRow?: BlueprintV1ParameterSelectNextRow;

    @IsIn(Object.keys(BlueprintV1ParameterWhenOutOfValues))
    @IsOptional()
    whenOutOfValues?: BlueprintV1ParameterWhenOutOfValues;

    constructor(name: string) {
        this.name = name;
    }

    getSelectNextRow(): BlueprintParameterSelectNextRow {
        switch(this.selectNextRow) {
            case BlueprintV1ParameterSelectNextRow.random:
                return BlueprintParameterSelectNextRow.random;
            case BlueprintV1ParameterSelectNextRow.sequential:
                return BlueprintParameterSelectNextRow.sequential;
            case BlueprintV1ParameterSelectNextRow.unique:
                return BlueprintParameterSelectNextRow.unique;
            default:
                return BlueprintParameterSelectNextRow.unique;
        }
    }

    getWhenOutOfValues(): BlueprintParameterWhenOutOfValues {
        switch(this.whenOutOfValues) {
            case BlueprintV1ParameterWhenOutOfValues.abortUser:
                return BlueprintParameterWhenOutOfValues.abortUser;
            case BlueprintV1ParameterWhenOutOfValues.cycle:
                return BlueprintParameterWhenOutOfValues.cycle;
            case BlueprintV1ParameterWhenOutOfValues.none:
                return BlueprintParameterWhenOutOfValues.none;
            case BlueprintV1ParameterWhenOutOfValues.repeatLast:
                return BlueprintParameterWhenOutOfValues.repeatLast;
            default:
                return BlueprintParameterWhenOutOfValues.cycle;
        }
    }
}

export class BlueprintV1ParameterDate {   
    @IsString() 
    // TODO: validate format
    format: string;

    @IsNumber()
    @TransformToInt()
    @IsOptional()
    offset?: number;

    @IsBoolean()
    @TransformToBoolean()
    @IsOptional()
    workingDays?: boolean;

    constructor(format: string) {
        this.format = format;
    }
}

export enum BlueprintV1ParameterType {
    date = 'date',
    file = 'file'
}

export class BlueprintV1Parameter {
    @IsDefinedOr(Object.keys(BlueprintV1ParameterType).concat('replace'))
    @Exclude()
    __topLevel: string;

    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsNotEmpty()
    @IsOptional()
    replace?: string;

    @ValidateNested()
    @Type(() => BlueprintV1ParameterFile)
    @Transform(({ value }) => typeof value === 'string' ? new BlueprintV1ParameterFile(value) : value)
    @IsDefinedXor(['file', 'date'])
    @IsOptional()
    file?: BlueprintV1ParameterFile;

    @ValidateNested()
    @Type(() => BlueprintV1ParameterDate)
    @Transform(({ value }) => typeof value === 'string' ? new BlueprintV1ParameterDate(value) : value)
    @IsDefinedXor(['file', 'date'])
    @IsOptional()
    date?: BlueprintV1ParameterDate;

    @IsIn(Object.keys(BlueprintV1ParameterUpdateValueOn))
    @IsOptional()
    updateValueOn?: BlueprintV1ParameterUpdateValueOn;

    @IsBlueprintV1Profiles()
    @IsOptional()
    profiles?: string[];

    constructor(name: string, replace: string) {
        this.name = name;
        this.replace = replace;
    }

    static fromShorthand(cmd: string): BlueprintV1Parameter {
        if (cmd.indexOf('->') < 0) {
            throw new Error(`Parameter shorthand must contain: '->'`);
        } 
        const tokens: string[] = cmd.split('->');
        for (let i = 0; i < tokens.length; i++) {
            tokens[i] = tokens[i].trim();
        }
        return new BlueprintV1Parameter(tokens[1], tokens[0]);
    }



    getUpdateValueOn(): BlueprintParameterUpdateValueOn {
        switch(this.updateValueOn) {
            case BlueprintV1ParameterUpdateValueOn.iteration:
                return BlueprintParameterUpdateValueOn.iteration;
            case BlueprintV1ParameterUpdateValueOn.occurrence:
                return BlueprintParameterUpdateValueOn.occurrence;
            case BlueprintV1ParameterUpdateValueOn.once:
                return BlueprintParameterUpdateValueOn.once;
            default:
                return BlueprintParameterUpdateValueOn.iteration;
        }
    }

    getParameter(): BlueprintParameter {
        return {
            name: this.name,
            replace: this.replace,
            date: this.date,
            file: this.file ? {
                name: this.file!.name,
                column: this.file!.column,
                firstDataLine: this.file!.firstDataLine,
                sameLineAs: this.file!.sameLineAs,
                selectNextRow: this.file!.getSelectNextRow(),
                whenOutOfValues: this.file!.getWhenOutOfValues()
            } : undefined,
            updateValueOn: this.getUpdateValueOn(),
            profiles: this.profiles
        };
    }

}

export class BlueprintV1File {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsNotEmpty()
    @IsOptional()
    sourcePath?: string;

    @IsString()
    @IsNotEmpty()
    @IsOptional()
    targetPath?: string;

    @IsBlueprintV1Profiles()
    @IsOptional()
    profiles?: string[];
}

export class BlueprintV1Assertion {
    @IsString()
    @IsNotEmpty()
    @IsOptional()
    name?: string;

    @IsString()
    @IsNotEmpty()
    text: string;

    @IsBlueprintV1Profiles()
    @IsOptional()
    profiles?: string[];

    constructor(text: string, name?: string) {
        this.text = text;
        this.name = name;
    }
}

export class BlueprintV1Script {
    @ValidateNested({ each: true })
    @Type(() => BlueprintV1Assertion)
    @TransformArray(({ value }) => typeof value === 'string' ? new BlueprintV1Assertion(value) : value)
    @IsOptional()
    assertions?: BlueprintV1Assertion[];

    @ValidateNested({ each: true })
    @Type(() => BlueprintV1File)
    @IsOptional()
    files?: BlueprintV1File[];

    @ValidateNested({ each: true })
    @Type(() => BlueprintV1Parameter)
    @IsOptional()
    parameters?: BlueprintV1Parameter[];

    @ValidateNested({ each: true })
    @Type(() => BlueprintV1Correlation)
    @IsOptional()
    correlations?: BlueprintV1Correlation[];

    @ValidateNested({ each: true })
    @Type(() => BlueprintV1Logic)
    @IsOptional()
    logic?: BlueprintV1Logic[];

    @ValidateNested({ each: true })
    @Type(() => BlueprintV1ExcludeHeader)
    @TransformArray(({ value }) => typeof value === 'string' ? new BlueprintV1ExcludeHeader(value) : value)
    @IsOptional()
    excludeHeaders?: BlueprintV1ExcludeHeader[];

    @ValidateNested({ each: true })
    @Type(() => BlueprintV1ExcludeUrl)
    @TransformArray(({ value }) => typeof value === 'string' ? new BlueprintV1ExcludeUrl(value) : value)
    @IsOptional()
    excludeUrls?: BlueprintV1ExcludeUrl[];
}

export class BlueprintV1Argument {
    @IsString()
    @IsOptional()
    defaultValue?: string;

    @IsBoolean()
    @TransformToBoolean()
    @IsOptional()
    optional?: boolean;

    constructor(defaultValue: string, optional?: boolean) {
        this.defaultValue = defaultValue;
        this.optional = optional;
    }
}

export class BlueprintV1ProfileSimulation {
    @ValidateNested()
    @Type(() => BlueprintV1SimulationConfig)
    @IsOptional()
    config?: BlueprintV1SimulationConfig;
}

export class BlueprintV1Profile {
    @IsInstance(Map)
    @ValidateNested({ each: true })
    @Type(() => BlueprintV1Argument)
    @TransformToArgs()
    @IsOptional()
    args?: Map<string, BlueprintV1Argument>;

    @ValidateNested()
    @Type(() => BlueprintV1ProfileSimulation)
    @IsOptional()
    simulation?: BlueprintV1ProfileSimulation;

    @ValidateNested()
    @Type(() => BlueprintV1Script)
    @IsOptional()
    script?: BlueprintV1Script;
}


export class BlueprintV1Blueprint {
    @IsNotEmpty()
    name: string;

    @IsInstance(Map)
    @ValidateNested({ each: true })
    @Type(() => BlueprintV1Argument)
    @TransformToArgs()
    @IsOptional()
    args?: Map<string, BlueprintV1Argument>;

    @ValidateNested()
    @Type(() => BlueprintV1Simulation)
    @IsOptional()
    simulation?: BlueprintV1Simulation;

    @ValidateNested()
    @Type(() => BlueprintV1Script)
    @IsOptional()
    script?: BlueprintV1Script;

    @IsInstance(Map)
    @ValidateNested({ each: true })
    @Type(() => BlueprintV1Profile)
    @IsOptional()
    profiles?: Map<string, BlueprintV1Profile>;
}

export class BlueprintV1Manifest {
    @IsString()
    @IsNotEmpty()
    version: string;

    @ValidateNested()
    @Type(() => BlueprintV1Blueprint)
    blueprint: BlueprintV1Blueprint;

    getManifest(): BlueprintManifest {
        const manifest: BlueprintManifest = {
            version: this.version,
            blueprint: {
                name: this.blueprint.name,
                args: this.blueprint.args,
                simulation: this.blueprint.simulation,
                script:  {
                    assertions: this.blueprint.script?.assertions,
                    correlations: this.blueprint.script?.correlations?.map(c => c.getCorrelation()),
                    excludeHeaders: this.blueprint.script?.excludeHeaders,
                    excludeUrls: this.blueprint.script?.excludeUrls,
                    files: this.blueprint.script?.files,
                    logic: this.blueprint.script?.logic,
                    parameters: this.blueprint.script?.parameters?.map(p => p.getParameter()),
                },
                profiles: this.getProfiles()
            }
        };
        return manifest;
    }

    getProfiles(): Map<string, BlueprintProfile> {
        const map = new Map<string, BlueprintProfile>();
        if(this.blueprint.profiles) {
            for(const [name, profile] of this.blueprint.profiles?.entries()) {
                map.set(name, {
                    args: profile.args,
                    simulation: profile.simulation,
                    script: {
                        assertions: profile.script?.assertions,
                        correlations: profile.script?.correlations?.map(c => c.getCorrelation()),
                        excludeHeaders: profile.script?.excludeHeaders,
                        excludeUrls: profile.script?.excludeUrls,
                        files: profile.script?.files,
                        logic: profile.script?.logic,
                        parameters: profile.script?.parameters?.map(p => p.getParameter()),
                    }
                })
            }
        }
        return map;
    }
}


export class BlueprintV1ImportRange {
    @IsNumber()
    @Min(1)
    @TransformToInt()
    from: number;

    @IsNumber()
    @Min(1)
    @IsGte('from')
    @IsOptional()
    @TransformToInt()
    to?: number;
    
    constructor(from: number, to?: number) {
        this.from = from;
        this.to = to;
    }
}
