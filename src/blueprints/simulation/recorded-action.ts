import { plainToInstance, Type } from "class-transformer";
import { IsIn, IsISO8601, IsString, ValidateNested } from "class-validator";
import { readFile } from "fs-extra";
import { validateInstance } from "../../validation";

export class RecordedAction {
    @IsString()
    name: string;

    @IsISO8601()
    date: string;

    @IsIn(['start', 'end'])
    state: 'start' | 'end';
}

export class RecordedActions {
    @ValidateNested({ each: true })
    @Type(() => RecordedAction)
    actions: RecordedAction[];
}

export async function loadActionsFile(path: string): Promise<RecordedActions> {
    const obj: any = parseBuffer(await readFile(path));
    const instance: RecordedActions = plainToInstance(RecordedActions, obj);
    await validateInstance(instance, { whitelist: true, forbidNonWhitelisted: true });
    return instance;
}

function parseBuffer(buffer: Buffer) {
    return parseString(buffer.toString('utf-8'));
}

function parseString(str: string) {
    return JSON.parse(str);
} 
