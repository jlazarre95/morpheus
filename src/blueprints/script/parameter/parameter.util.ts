import moment from "moment";
import { BlueprintTimeUnit, BlueprintParameter, BlueprintRequestResponseFilter, BlueprintDuration } from "../../models";
import { HarRequest, HarResponse } from "../har";
import { Substitutions } from "../substitution/substitution.util";

export interface SubstituteParametersOptions {
    originalRequest?: HarRequest;
    actions?: string[];
    occurrences?: Map<BlueprintRequestResponseFilter, number>;
}

export namespace Parameters {

    export function substitute(request: HarRequest, response: HarResponse, parameters: BlueprintParameter[], options: SubstituteParametersOptions = {}) {
        const { actions, originalRequest, occurrences } = options;
        for(const parameter of parameters) {
            if(parameter.replace) {
                for(const r of parameter.replace) {
                    Substitutions.substitute(request, parameter.name, r.text!, { response, originalRequest, actions, occurrences, filters: r.filters, ignoreCase: r.ignoreCase });
                }
            }
        }
    }

    export function setDates(parameters: BlueprintParameter[], date: Date) {
        for(const parameter of parameters) {
            if(parameter.date && parameter.replace) {
                for(const r of parameter.replace) {
                    if(r.date) {
                        const format: string = r.date.format;
                        const offset: BlueprintDuration | undefined = parameter.date.offset;
                        const offsetDate = getOffsetDate(date, offset);
                        r.text = moment(offsetDate).format(format);
                        // const dateString = moment(date).format(format);

                        // if(r.date.date) {
                        //     const momentDate = moment(r.date.date, r.date.format);
                        //     if(!momentDate.isValid()) {
                        //         throw new Error(`Date is invalid: (date=${r.date.date}, format=${r.date.format})`);
                        //     }
                        //     r.text = momentDate.format();
                        // } else {
                        //     const dateString = moment(date).format(r.date.format);
                        //     r.text = dateString;
                        // }
                        
                    }
                }
            }
        }
    }

    export function getOffsetDate(date: Date, offset?: BlueprintDuration): Date { 
        return !offset ? date : moment(date).add(offset.amount, getMomentTimeUnit(offset.unit)).toDate();
    }

    export function getMomentTimeUnit(unit: BlueprintTimeUnit): moment.unitOfTime.DurationConstructor {
        switch(unit) {
            case BlueprintTimeUnit.milliseconds:
                return "milliseconds";
            case BlueprintTimeUnit.seconds:
                return "seconds";
            case BlueprintTimeUnit.minutes:
                return "minutes";
            case BlueprintTimeUnit.hours:
                return "hours";
            case BlueprintTimeUnit.days:
                return "days";
            case BlueprintTimeUnit.weeks:
                return "weeks";
            case BlueprintTimeUnit.months:
                return "months";
            case BlueprintTimeUnit.years:
                return "years";
            default:
                return "seconds";
        }
    }

}