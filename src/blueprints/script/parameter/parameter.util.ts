import moment from "moment";
import { BlueprintParameter, BlueprintRequestResponseFilter } from "../../models";
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
                        const dateString = moment(date).format(r.date.format);
                        r.text = dateString;
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

}