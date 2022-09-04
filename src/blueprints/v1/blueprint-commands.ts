import { Transform, Type } from "class-transformer";
import { ArrayMinSize, IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString, Min, ValidateNested } from "class-validator";
import { BlueprintImportRange, BlueprintSelector } from ".";
import { PressableKey, WaitUntilState } from "../../simulation/browser/browser.service";
import { stringsToRanges } from "../../util/parse.util";
import { IsBlueprintSelector, IsWaitForTimeout, IsWaitForWaitUntil } from "../blueprint.validators";
import { getBlueprintSelector } from "./blueprint.util";

export class BlueprintSetWindowSizeCommand {
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

    static fromShorthand(cmd: string): BlueprintSetWindowSizeCommand {
        const tokens: string[] = cmd.split('x');
        return new BlueprintSetWindowSizeCommand(parseInt(tokens[0]), parseInt(tokens[1]));
    }
}

export class BlueprintTypeCommand {
    @IsString()
    text: string;

    @IsBlueprintSelector()
    @IsOptional()
    selector?: BlueprintSelector;

    constructor(text: string, selector?: string | BlueprintSelector) {
        this.text = text;
        this.selector = getBlueprintSelector(selector)!;
    }

    static fromShorthand(cmd: string): BlueprintTypeCommand {
        if (cmd.indexOf('->') >= 0) {
            const tokens: string[] = cmd.split('->');
            for (let i = 0; i < tokens.length; i++) {
                tokens[i] = tokens[i].trim();
            }
            return new BlueprintTypeCommand(tokens[0], tokens[1]);
        } else {
            return new BlueprintTypeCommand(cmd);
        }
    }
}

export class BlueprintImportCommand {
    @IsString()
    @IsNotEmpty()
    name: string;

    @ValidateNested({ each: true })
    @Type(() => BlueprintImportRange)
    @Transform(({ value }) => typeof value === 'string' ? BlueprintImportCommand.fromShorthand(value) : value)
    @ArrayMinSize(1)
    @IsOptional()
    ranges?: BlueprintImportRange[];

    constructor(name: string, ranges?: BlueprintImportRange[]) {
        this.name = name;
        this.ranges = ranges;
    }

    static fromShorthand(cmd: string): BlueprintImportCommand {
        if (cmd.indexOf('@') < 0) {
            return new BlueprintImportCommand(cmd);
        } 
        let name: string = cmd;
        let ranges: string[] = [];
        const tokens: string[] = cmd.split('@');
        name = tokens[0];
        ranges = tokens[1].split(',');
        const importRangesArr: BlueprintImportRange[] = [];
        stringsToRanges(ranges).forEach(r => importRangesArr.push(new BlueprintImportRange(r.from, r.to)));
        return new BlueprintImportCommand(name, importRangesArr);
    }
}

export class BlueprintFindCommand {
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

export class BlueprintClickCommand {
    @IsBlueprintSelector()
    selector: BlueprintSelector;

    constructor(selector: string | BlueprintSelector) {
        this.selector = getBlueprintSelector(selector)!;
    }
}


export class BlueprintClearCommand {
    @IsBlueprintSelector()
    selector: BlueprintSelector;

    constructor(selector: string | BlueprintSelector) {
        this.selector = getBlueprintSelector(selector)!;
    }
}

export class BlueprintTapCommand {
    @IsBlueprintSelector()
    selector: BlueprintSelector;

    constructor(selector: string | BlueprintSelector) {
        this.selector = getBlueprintSelector(selector)!;
    }
}

export class BlueprintGoToCommand {
    @IsString()
    @IsNotEmpty()
    url: string;

    constructor(url: string) {
        this.url = url;
    }
}

export class BlueprintNewPageCommand { }
export class BlueprintCloseCommand { }
export class BlueprintClosePageCommand { }

export class BlueprintLogCommand {
    @IsString()
    message: string;

    constructor(message: string) {
        this.message = message;
    }
}

export class BlueprintScreenshotCommand {
    @IsString()
    name: string; // TODO: validate file extension and is a file name not a path

    constructor(name: string) {
        this.name = name;
    }
}

export class BlueprintPressCommand {
    @IsString()
    key: PressableKey;

    @IsBlueprintSelector()
    @IsOptional()
    selector?: BlueprintSelector;

    @IsString()
    @IsOptional()
    text?: string;

    constructor(key: PressableKey, selector?: string | BlueprintSelector) {
        this.key = key;
        this.selector = getBlueprintSelector(selector);
    }

    static fromShorthand(cmd: string): BlueprintPressCommand {
        if (cmd.indexOf('->') >= 0) {
            const tokens: string[] = cmd.split('->');
            for (let i = 0; i < tokens.length; i++) {
                tokens[i] = tokens[i].trim();
            }
            return new BlueprintPressCommand(tokens[0], tokens[1]);
        } else {
            return new BlueprintPressCommand(cmd);
        }
    }
}


export class BlueprintGoBackCommand {
    @IsWaitForTimeout()
    timeout?: number;

    @IsWaitForWaitUntil()
    waitUntil?: WaitUntilState[];

    constructor(timeout?: number) {
        this.timeout = timeout;
    }
}

export class BlueprintGoForwardCommand {
    @IsWaitForTimeout()
    timeout?: number;

    @IsWaitForWaitUntil()
    waitUntil?: WaitUntilState[];

    constructor(timeout?: number) {
        this.timeout = timeout;
    }
}

export class BlueprintHoverCommand {
    @IsBlueprintSelector()
    selector: BlueprintSelector;

    constructor(selector: string | BlueprintSelector) {
        this.selector = getBlueprintSelector(selector)!;
    }
}

export class BlueprintReloadCommand {
    @IsWaitForTimeout()
    timeout?: number;

    @IsWaitForWaitUntil()
    waitUntil?: WaitUntilState[];

    constructor(timeout?: number) {
        this.timeout = timeout;
    }
}

export class BlueprintSetGeoLocationCommand {
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

    static fromShorthand(shorthand: string): BlueprintSetGeoLocationCommand {
        const tokens = shorthand.split(',');
        return new BlueprintSetGeoLocationCommand(parseFloat(tokens[0]), parseFloat(tokens[1]));
    }
}

export class BlueprintSetUserAgentCommand {
    @IsString()
    userAgent: string;

    constructor(userAgent: string) {
        this.userAgent = userAgent;
    }
}

export class BlueprintWaitForFrameCommand {
    @IsString()
    urlOrPredicate: string;

    constructor(urlOrPredicate: string) {
        this.urlOrPredicate = urlOrPredicate;
    }
}

export class BlueprintWaitForNavigationCommand {
    @IsWaitForTimeout()
    timeout?: number;

    @IsWaitForWaitUntil()
    waitUntil?: WaitUntilState[];

    constructor(timeout?: number) {
        this.timeout = timeout;
    }
}

export class BlueprintWaitForNetworkIdleCommand {
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

export class BlueprintWaitForSelectorOptions {
    @IsBoolean()
    @IsOptional()
    visible?: boolean;

    @IsBoolean()
    @IsOptional()
    hidden?: boolean;

    @IsNumber()
    @Min(0)
    @IsOptional()
    timeout?: number;
}

export class BlueprintWaitForCommand {
    @IsBlueprintSelector()
    selector: BlueprintSelector;

    @IsString()
    @IsNotEmpty()
    @IsOptional()
    saveAs?: string;

    @ValidateNested()
    @Type(() => BlueprintWaitForSelectorOptions)
    @IsOptional()
    options?: BlueprintWaitForSelectorOptions;

    constructor(selector: string | BlueprintSelector) {
        this.selector = getBlueprintSelector(selector)!;
    }
}

export class BlueprintFocusCommand {
    @IsBlueprintSelector()
    selector: BlueprintSelector;

    constructor(selector: string | BlueprintSelector) {
        this.selector = getBlueprintSelector(selector)!;
    }
}

export class BlueprintMainFrameCommand {

}

export class BlueprintEvaluateHandleCommand {
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