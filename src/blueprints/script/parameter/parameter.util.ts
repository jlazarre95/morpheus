import { BlueprintParameter } from "../../models";
import { HarRequest } from "../har";
import { Substitutions } from "../substitution/substitution.util";

export interface SubstituteParametersOptions {
    originalRequest?: HarRequest;
    transactionNames?: string[];
}

export namespace Parameters {

    export function substitute(request: HarRequest, rules: BlueprintParameter[], options: SubstituteParametersOptions = {}) {
        for(const rule of rules) {
            if(rule.replace) {
                Substitutions.substitute(request, rule.name, rule.replace, { originalRequest: options.originalRequest, /*filters: rule.replace.filters*/ });
            }
        }
    }

}