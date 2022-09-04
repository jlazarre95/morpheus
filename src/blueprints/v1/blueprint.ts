import { Exclude, Transform, Type } from "class-transformer";
import { ArrayMinSize, IsBoolean, isDefined, IsIn, IsInstance, isNotEmpty, IsNotEmpty, IsNumber, IsOptional, IsString, Min, ValidateNested } from "class-validator";
import { IsDefinedOr } from "../../util/is-defined-or.validator";
import { IsDefinedXor } from "../../util/is-defined-xor.validator";
import { IsGte } from "../../util/is-gte.validator";
import { IsOfType } from "../../util/is-of-type.validator";
import { IsOrdinal } from "../../util/is-ordinal.validator";
import { IsTypeOf } from "../../util/is-type-of.validator";
import { Ensure } from "../../util/validation.util";
import { IsBlueprintSelector, TransformToArgs, TransformToInt } from "../blueprint.validators";
import { BlueprintClearCommand, BlueprintClickCommand, BlueprintCloseCommand, BlueprintClosePageCommand, BlueprintEvaluateHandleCommand, BlueprintFindCommand, BlueprintFocusCommand, BlueprintGoBackCommand, BlueprintGoForwardCommand, BlueprintGoToCommand, BlueprintHoverCommand, BlueprintImportCommand, BlueprintLogCommand, BlueprintMainFrameCommand, BlueprintNewPageCommand, BlueprintPressCommand, BlueprintReloadCommand, BlueprintScreenshotCommand, BlueprintSetGeoLocationCommand, BlueprintSetUserAgentCommand, BlueprintSetWindowSizeCommand, BlueprintTapCommand, BlueprintTypeCommand, BlueprintWaitForCommand, BlueprintWaitForFrameCommand, BlueprintWaitForNavigationCommand, BlueprintWaitForNetworkIdleCommand, BlueprintWaitForSelectorOptions } from "./blueprint-commands";
import { getBlueprintSelector, transformToBlueprintArguments } from "./blueprint.util";
import { CommandName } from "./command-names";

export class BlueprintSelector {
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

export enum SimulationConditionName {
    selector = 'selector',
    waitFor = 'waitFor',
    and = 'and',
    or = 'or',
    not = 'not',
    xor = 'xor',
}

export class BlueprintWaitFor {
    @IsBlueprintSelector()
    selector: BlueprintSelector;

    @ValidateNested()
    @Type(() => BlueprintWaitForSelectorOptions)
    @IsOptional()
    options?: BlueprintWaitForSelectorOptions;

    constructor(selector: string | BlueprintSelector) {
        this.selector = getBlueprintSelector(selector)!;
    }
}

export class BlueprintSimulationCondition {
    @IsDefinedXor(Object.keys(SimulationConditionName))
    @Exclude()
    private __topLevel: string;

    @ValidateNested({ each: true })
    @Type(() => BlueprintSimulationCondition)
    @IsOptional()
    and?: BlueprintSimulationCondition[];

    @ValidateNested({ each: true })
    @Type(() => BlueprintSimulationCondition)
    @IsOptional()
    or?: BlueprintSimulationCondition[];

    @ValidateNested()
    @Type(() => BlueprintSimulationCondition)
    @IsOptional()
    not?: BlueprintSimulationCondition;

    @ValidateNested({ each: true })
    @Type(() => BlueprintSimulationCondition)
    @IsOptional()
    xor?: BlueprintSimulationCondition[];

    @IsBlueprintSelector()
    @IsOptional()
    selector?: BlueprintSelector;

    @ValidateNested()
    @Type(() => BlueprintWaitFor)
    @Transform(({ value }) => typeof value === 'string' ? new BlueprintWaitFor(value) : value)
    @IsOptional()
    waitFor?: BlueprintWaitFor;

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

export class BlueprintXPath {
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

export class BlueprintLoop {
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

export class BlueprintLogic {
    @IsString()
    @IsNotEmpty()
    type: string;

    @ValidateNested()
    @Type(() => BlueprintLoop)
    @IsOptional()
    loop?: BlueprintLoop;
}

export class BlueprintRegex {
    @IsString()
    @IsNotEmpty()
    pattern: string;

    @IsNumber()
    @Min(0)
    @IsOptional()
    @TransformToInt()
    group?: number;
}

export class BlueprintBoundary {
    @IsString()
    @IsNotEmpty()
    @IsOptional()
    @IsDefinedOr(['right'])
    left?: string;

    @IsString()
    @IsNotEmpty()
    @IsOptional()
    right?: string;
}

export class BlueprintCorrelation {
    @IsString()
    @IsNotEmpty()
    @IsOptional()
    name?: string;

    @ValidateNested()
    @Type(() => BlueprintBoundary)
    @IsOptional()
    boundary?: BlueprintBoundary;

    @ValidateNested()
    @Type(() => BlueprintRegex)
    @IsOptional()
    regex?: BlueprintRegex;

    @IsString()
    @IsNotEmpty()
    @IsOptional()
    import?: string;

    @IsIn(['headers', 'body', 'all'])
    @IsOptional()
    search?: "headers" | "body" | "all";

    @IsOrdinal()
    @TransformToInt()
    ordinal?: number | "all";
}

export class BlueprintParameter {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsNotEmpty()
    replace: string;

    @IsString()
    @IsNotEmpty()
    @IsOptional()
    file?: string;

    @IsString()
    @IsNotEmpty()
    @IsOptional()
    column?: string;
}

export class BlueprintFile {
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
}

export class BlueprintAssertion {
    @IsString()
    @IsNotEmpty()
    @IsOptional()
    name?: string;

    @IsString()
    @IsNotEmpty()
    text: string;

    constructor(text: string, name?: string) {
        this.text = text;
        this.name = name;
    }
}

export class BlueprintScript {
    @ValidateNested({ each: true })
    @Type(() => BlueprintAssertion)
    @Transform(({ value }) => typeof value === 'string' ? new BlueprintAssertion(value) : value)
    @IsOptional()
    assertions?: BlueprintAssertion[];

    @ValidateNested({ each: true })
    @Type(() => BlueprintFile)
    @IsOptional()
    files?: BlueprintFile[];

    @ValidateNested({ each: true })
    @Type(() => BlueprintParameter)
    @IsOptional()
    parameters?: BlueprintParameter[];

    @ValidateNested({ each: true })
    @Type(() => BlueprintCorrelation)
    @IsOptional()
    correlations?: BlueprintCorrelation[];

    @ValidateNested({ each: true })
    @Type(() => BlueprintLogic)
    @IsOptional()
    logic?: BlueprintLogic[];
}

export class BlueprintImportRange {
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

export class BlueprintCommand {
    @IsDefinedXor(Object.keys(CommandName))
    @Exclude()
    private __topLevel: string;

    @ValidateNested()
    @Type(() => BlueprintFindCommand)
    @Transform(({ value }) => typeof value === 'string' ? new BlueprintFindCommand(value) : value)
    @IsOptional()
    $?: BlueprintFindCommand;

    @ValidateNested()
    @Type(() => BlueprintClearCommand)
    @Transform(({ value }) => typeof value === 'string' ? new BlueprintClearCommand(value) : value)
    @IsOptional()
    clear?: BlueprintClearCommand;

    @ValidateNested()
    @Type(() => BlueprintClickCommand)
    @Transform(({ value }) => typeof value === 'string' ? new BlueprintClickCommand(value) : value)
    @IsOptional()
    click?: BlueprintClickCommand;

    @ValidateNested()
    @Type(() => BlueprintCloseCommand)
    @IsOptional()
    close?: BlueprintCloseCommand;

    @ValidateNested()
    @Type(() => BlueprintClosePageCommand)
    @IsOptional()
    closePage?: BlueprintClosePageCommand;

    @ValidateNested()
    @Type(() => BlueprintEvaluateHandleCommand)
    @Transform(({ value }) => typeof value === 'string' ? new BlueprintEvaluateHandleCommand(value) : value)
    @IsOptional()
    evaluateHandle?: BlueprintEvaluateHandleCommand;

    @ValidateNested()
    @Type(() => BlueprintFindCommand)
    @Transform(({ value }) => typeof value === 'string' ? new BlueprintFindCommand(value) : value)
    @IsOptional()
    find?: BlueprintFindCommand;

    @ValidateNested()
    @Type(() => BlueprintFocusCommand)
    @Transform(({ value }) => typeof value === 'string' ? new BlueprintFocusCommand(value) : value)
    @IsOptional()
    focus?: BlueprintFocusCommand;

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
    @Type(() => BlueprintGoBackCommand)
    @Transform(({ value }) => typeof value === 'number' ? new BlueprintGoBackCommand(value) : value)
    @IsOptional()
    goBack?: BlueprintGoBackCommand;

    @ValidateNested()
    @Type(() => BlueprintGoForwardCommand)
    @Transform(({ value }) => typeof value === 'number' ? new BlueprintGoForwardCommand(value) : value)
    @IsOptional()
    goForward?: BlueprintGoForwardCommand;

    @ValidateNested()
    @Type(() => BlueprintGoToCommand)
    @Transform(({ value }) => typeof value === 'string' ? new BlueprintGoToCommand(value) : value)
    @IsOptional()
    goto?: BlueprintGoToCommand;

    @ValidateNested()
    @Type(() => BlueprintHoverCommand)
    @Transform(({ value }) => typeof value === 'string' ? new BlueprintHoverCommand(value) : value)
    @IsOptional()
    hover?: BlueprintHoverCommand;

    @ValidateNested()
    @Type(() => BlueprintImportCommand)
    @Transform(({ value }) => typeof value === 'string' ? BlueprintImportCommand.fromShorthand(value) : value)
    @IsOptional()
    import?: BlueprintImportCommand;

    @ValidateNested()
    @Type(() => BlueprintLogCommand)
    @Transform(({ value }) => typeof value === 'string' ? new BlueprintLogCommand(value) : value)
    @IsOptional()
    log?: BlueprintLogCommand;

    @ValidateNested()
    @Type(() => BlueprintMainFrameCommand)
    @IsOptional()
    mainFrame?: BlueprintMainFrameCommand;

    @ValidateNested()
    @Type(() => BlueprintNewPageCommand)
    @IsOptional()
    newPage?: BlueprintNewPageCommand;

    @ValidateNested()
    @Type(() => BlueprintPressCommand)
    @Transform(({ value }) => typeof value === 'string' ? BlueprintPressCommand.fromShorthand(value) : value)
    @IsOptional()
    press?: BlueprintPressCommand;

    @ValidateNested()
    @Type(() => BlueprintReloadCommand)
    @Transform(({ value }) => typeof value === 'number' ? new BlueprintReloadCommand(value) : value)
    @IsOptional()
    reload?: BlueprintReloadCommand;

    @ValidateNested()
    @Type(() => BlueprintNewPageCommand)
    @Transform(({ value }) => typeof value === 'string' ? new BlueprintScreenshotCommand(value) : value)
    @IsOptional()    
    screenshot?: BlueprintScreenshotCommand;

    @IsBoolean()
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
    @Type(() => BlueprintSetGeoLocationCommand)
    @Transform(({ value }) => typeof value === 'string' ? BlueprintSetGeoLocationCommand.fromShorthand(value) : value)
    @IsOptional()
    setGeoLocation?: BlueprintSetGeoLocationCommand;

    @IsBoolean()
    @IsOptional()
    setJavascriptEnabled?: boolean;

    @IsBoolean()
    @IsOptional()
    setOfflineMode?: boolean;

    @ValidateNested()
    @Type(() => BlueprintSetUserAgentCommand)
    @Transform(({ value }) => typeof value === 'string' ? new BlueprintSetUserAgentCommand(value) : value)
    @IsOptional()
    setUserAgent?: BlueprintSetUserAgentCommand;

    @ValidateNested()
    @Type(() => BlueprintSetWindowSizeCommand)
    @Transform(({ value }) => typeof value === 'string' ? BlueprintSetWindowSizeCommand.fromShorthand(value) : value)
    @IsOptional()
    setWindowSize?: BlueprintSetWindowSizeCommand;

    @ValidateNested()
    @Type(() => BlueprintTapCommand)
    @Transform(({ value }) => typeof value === 'string' ? new BlueprintTapCommand(value) : value)
    @IsOptional()
    tap?: BlueprintTapCommand;

    @ValidateNested()
    @Type(() => BlueprintTypeCommand)
    @Transform(({ value }) => typeof value === 'string' ? BlueprintTypeCommand.fromShorthand(value) : value)
    @IsOptional()
    type?: BlueprintTypeCommand;

    @IsNumber()
    @Min(0)
    @IsOptional()
    @TransformToInt()
    wait?: number;

    @ValidateNested()
    @Type(() => BlueprintWaitForFrameCommand)
    @Transform(({ value }) => typeof value === 'string' ? new BlueprintWaitForFrameCommand(value) : value)
    @IsOptional()
    waitForFrame?: BlueprintWaitForFrameCommand;

    @ValidateNested()
    @Type(() => BlueprintWaitForNavigationCommand)
    @Transform(({ value }) => !isDefined(value) || typeof value === 'number' ? new BlueprintWaitForNavigationCommand(value) : value)
    @IsOptional()
    waitForNavigation?: BlueprintWaitForNavigationCommand;

    @ValidateNested()
    @Type(() => BlueprintWaitForNetworkIdleCommand)
    @Transform(({ value }) => !isDefined(value) || typeof value === 'number' ? new BlueprintWaitForNetworkIdleCommand(value) : value)
    @IsOptional()
    waitForNetworkIdle?: BlueprintWaitForNetworkIdleCommand;

    @ValidateNested()
    @Type(() => BlueprintWaitForCommand)
    @Transform(({ value }) => typeof value === 'string' ? new BlueprintWaitForCommand(value) : value)
    @IsOptional()
    waitFor?: BlueprintWaitForCommand;

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
    @Type(() => BlueprintSimulationCondition)
    @IsOptional()
    condition?: BlueprintSimulationCondition;

    @IsString({ each: true })
    @IsNotEmpty({ each: true })
    @IsOptional()
    profiles?: string[];

    getCommand(): CommandName | undefined {
        const keys: string[] = Object.keys(this);
        for(const key of keys) {
            if(key in CommandName) {
                return <CommandName> key;
            }
        }
        return undefined;
    }
}

export class BlueprintAction {
    @IsString()
    @IsNotEmpty()
    name: string;

    @ValidateNested({ each: true })
    @Type(() => BlueprintCommand)
    @IsOptional()
    commands?: BlueprintCommand[];

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
    @Type(() => BlueprintSimulationCondition)
    @IsOptional()
    condition?: BlueprintSimulationCondition;

    @IsString({ each: true })
    @IsNotEmpty({ each: true })
    @IsOptional()
    profiles?: string[];

    constructor(name: string) {
        this.name = name;
        this.commands = [];
    }
}

export class BlueprintArgument {
    @IsString()
    @IsOptional()
    defaultValue?: string;

    @IsBoolean()
    @IsOptional()
    optional?: boolean;

    constructor(defaultValue: string, optional?: boolean) {
        this.defaultValue = defaultValue;
        this.optional = optional;
    }
}

export class BlueprintSimulationConfig {
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

    // @IsIn(['chrome'])
    // @IsOptional()
    // browser?: 'chrome';

    @IsBoolean()
    @IsOptional()
    orderScreenshots?: boolean;
}

export class BlueprintSimulation {
    @ValidateNested()
    @Type(() => BlueprintSimulationConfig)
    @IsOptional()
    config?: BlueprintSimulationConfig;

    @IsIn(['puppeteer'])
    @IsOptional()
    type?: 'puppeteer';

    @ValidateNested({ each: true })
    @Type(() => BlueprintAction)
    @ArrayMinSize(1)
    actions: BlueprintAction[];
}


export class BlueprintProfileSimulation {
    @ValidateNested()
    @Type(() => BlueprintSimulationConfig)
    @IsOptional()
    config?: BlueprintSimulationConfig;
}

export class BlueprintProfile {
    @IsInstance(Map)
    @ValidateNested({ each: true })
    @Type(() => BlueprintArgument)
    @TransformToArgs()
    @IsOptional()
    args?: Map<string, BlueprintArgument>;

    @ValidateNested()
    @Type(() => BlueprintProfileSimulation)
    @IsOptional()
    simulation?: BlueprintProfileSimulation;

    @ValidateNested()
    @Type(() => BlueprintScript)
    @IsOptional()
    script?: BlueprintScript;
}

export class BlueprintOnlyArgs {
    @IsInstance(Map)
    @ValidateNested({ each: true })
    @Type(() => BlueprintArgument)
    @TransformToArgs()
    @IsOptional()
    args?: Map<string, BlueprintArgument>;
}

export class Blueprint {
    @IsNotEmpty()
    name: string;

    @IsInstance(Map)
    @ValidateNested({ each: true })
    @Type(() => BlueprintArgument)
    @TransformToArgs()
    @IsOptional()
    args?: Map<string, BlueprintArgument>;

    @ValidateNested()
    @Type(() => BlueprintSimulation)
    @IsOptional()
    simulation?: BlueprintSimulation;

    @ValidateNested()
    @Type(() => BlueprintScript)
    @IsOptional()
    script?: BlueprintScript;

    @IsInstance(Map)
    @ValidateNested({ each: true })
    @Type(() => BlueprintProfile)
    @IsOptional()
    profiles?: Map<string, BlueprintProfile>;
}

export class BlueprintManifest {
    @IsString()
    @IsNotEmpty()
    version: string;

    @ValidateNested()
    @Type(() => Blueprint)
    blueprint: Blueprint;
}