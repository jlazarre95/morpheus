import { isDefined } from "class-validator";
import { Dict } from "../../../../types";
import { Stringifyable } from "../../../../types/stringifyable";
import { BlueprintFile, BlueprintParameter, BlueprintParameterSelectNextRow, BlueprintParameterType, BlueprintParameterUpdateValueOn, BlueprintParameterWhenOutOfValues } from "../../../models";

export interface LrPrmFileOptions {
    parameters: BlueprintParameter[];
    files: BlueprintFile[];
    numRecords: Dict<number>;
}

export class LrPrmFile implements Stringifyable {

    private fileMap: Dict<BlueprintFile> = {};

    constructor(private options: LrPrmFileOptions) {
        for(const f of options.files) {
            this.fileMap[f.name] = f;
        }
    }

    toString(): string {
        let str: string = '';
        for(const p of this.options.parameters) {
            const type = BlueprintParameter.getType(p);
            switch(type) {
                case BlueprintParameterType.file:
                    str += this.getFile(p);
                    break;
                case BlueprintParameterType.date:
                    str += this.getDate(p);
                    break;
            }
        }
        return str;
    }

    private getFile(p: BlueprintParameter): string {
        const columnName: string = p.file!.column || p.name;
        const delimiter: string = p.file!.delimiter || ',';
        const startRow: number = p.file!.firstDataLine || 1;
        const totalRecords: number = this.options.numRecords[this.fileMap[p.file!.name].name];
        const generateNewVal: string = this.getGenerateNewVal(p.updateValueOn);
        const outOfRangePolicy: string = this.getOutOfRangePolicy(p.file!.whenOutOfValues);
        const selectNextRow: string = this.getSelectNextRow(p);
        const fileName: string = this.fileMap[p.file!.name].targetPath!;
        return `[parameter:${p.name}]
ColumnName="${columnName}"
Delimiter="${delimiter}"
GenerateNewVal="${generateNewVal}"
OriginalValue=""
OutOfRangePolicy="${outOfRangePolicy}"
ParamName="${p.name}"
SelectNextRow="${selectNextRow}"
StartRow="${startRow}"
Table="${fileName}"
TableLocation="Local"
TotalRecords="${totalRecords}"
Type="Table"
auto_allocate_block_size="1"
value_for_each_vuser="1"\n`;
    }


    private getDate(p: BlueprintParameter): string {
        const generateNewVal: string = this.getGenerateNewVal(p.updateValueOn);
        const format: string = p.date!.format;
        const offset: number = isDefined(p.date!.offset) ? p.date!.offset! : 0;
        const workingDaysOn: string = p.date!.workingDays ? '1' : '0';
        return `[parameter:${p.name}]
Format="${format}"
GenerateNewVal="${generateNewVal}"
Offset="${offset}"
OffsetUI="${offset}"
OriginalValue=""
ParamName="${p.name}"
Type="Time"
WorkingDaysOn="${workingDaysOn}"\n`;
    }

    private getGenerateNewVal(updateValueOn?: BlueprintParameterUpdateValueOn): string {
        if(!updateValueOn) {
            return '';
        }
        switch(updateValueOn) {
            case BlueprintParameterUpdateValueOn.iteration:
                return 'EachIteration';
            case BlueprintParameterUpdateValueOn.occurrence:
                return 'EachOccurrence';
            case BlueprintParameterUpdateValueOn.once:
                return 'Once';
            default:
                throw new Error(`Unsupported generateNewVal: ${updateValueOn}`);
        }
    }

    private getOutOfRangePolicy(whenOutOfValues?: BlueprintParameterWhenOutOfValues): string {
        if(!whenOutOfValues) {
            return '';
        }
        switch(whenOutOfValues) {
            case BlueprintParameterWhenOutOfValues.cycle:
                return 'ContinueCyclic';
            case BlueprintParameterWhenOutOfValues.repeatLast:
                return 'ContinueWithLast';
            case BlueprintParameterWhenOutOfValues.abortUser:
                return 'AbortVuser';
            case BlueprintParameterWhenOutOfValues.none:
                return 'None';
            default:
                throw new Error(`Unsupported outOfRangePolicy: ${whenOutOfValues}`);
        }
    }

    private getSelectNextRow(parameter: BlueprintParameter): string {
        if(parameter.file!.sameLineAs) {
            return 'Same line as ' + parameter.file!.sameLineAs;
        }
        if(!parameter.file!.selectNextRow) {
            return '';
        }
        switch(parameter.file!.selectNextRow) {
            case BlueprintParameterSelectNextRow.sequential:
                return 'Sequential';
            case BlueprintParameterSelectNextRow.random:
                return 'Random';
            case BlueprintParameterSelectNextRow.unique:
                return 'Unique';
            default:
                throw new Error(`Unsupported selectNextRow: ${parameter.file!.selectNextRow}`);
        }
    }

}