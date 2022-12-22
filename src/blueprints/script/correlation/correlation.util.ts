
import { isDefined } from "class-validator";
import { Dict } from "../../../types";
import { matchWildcardPattern } from "../../../util/string.util";
import { BlueprintCorrelation, BlueprintCorrelationScope, BlueprintCorrelationType, BlueprintRequestResponseFilter } from "../../models";
import { HarRequest, HarResponse, Har } from "../har";
import { Substitutions } from "../substitution/substitution.util";
import { MatchedCorrelationRule } from "./matched-correlation-rule";

export interface SubstituteCorrelationsOptions {
    matches: Dict<CorrelationScanContext>;
    originalRequest?: HarRequest;
    actions?: string[];
    occurrences?: Map<BlueprintRequestResponseFilter, number>;
}

export interface CorrelationScanContext {
    paramName: string;
    correlationRule: BlueprintCorrelation;
}

export interface ScanResponseOptions {
    indexes: Dict<number>;
    matches: Dict<CorrelationScanContext>;
    request?: HarRequest;
}

export interface SearchResponseOptions {
    request?: HarRequest;
}

export namespace Correlations {


    export function substitute(request: HarRequest, response: HarResponse, options: SubstituteCorrelationsOptions) {
        const { actions, originalRequest, occurrences } = options;
        for(const [paramValue, ctx] of Object.entries(options.matches)) {
            Substitutions.substitute(request, ctx.paramName, paramValue, { response, originalRequest, actions, filters: ctx.correlationRule.replaceFilters, occurrences  });
        }
    }

    export function scan(response: HarResponse, rules: BlueprintCorrelation[], options: ScanResponseOptions): MatchedCorrelationRule[] {
        const matchedCorrelations: MatchedCorrelationRule[] = [];
        for(const rule of rules) {
            let matches: string[];
            try {
                matches = searchResponse(response, rule, { request: options.request });
            } catch(err: any) {
                throw new Error(`Error scanning response for correlation rule ${rule.name}` + err.message);
            }
            if(matches.length >= 1) {
                const paramName: string = computeParamName(rule.name, options.indexes); // TODO: check undefined rule.name
                for(const match of matches) {
                    const newParamName: string = rule.all ? computeParamName(paramName, options.indexes) : paramName;
                    options.matches[match] = {
                        paramName: newParamName,
                        correlationRule: rule
                    };
                }
                matchedCorrelations.push({
                    paramName: paramName,
                    paramValues: matches,
                    rule: rule
                });
            }
        }
        return matchedCorrelations;
    }

    export function searchResponse(response: HarResponse, rule: BlueprintCorrelation, options: SearchResponseOptions = {}): string[] {
        const matches: string[] = [];
        const url: string | undefined = options.request ? options.request.url : undefined;
        if(matchWildcardPattern(url, rule.url)) {
            const headers: string = Har.headersToString(response.headers);
            const body: string = response.content.text;
            let string: string;
            if(rule.scope === BlueprintCorrelationScope.headers) {
                string = headers;
            } else if(rule.scope === BlueprintCorrelationScope.body) {
                string = body;
            } else if(!rule.scope || rule.scope === BlueprintCorrelationScope.all) {
                string = headers + body;
            } else {
                string = "";
            }
            matches.push(...searchString(string, rule));
        }
        return matches;
    }

    export function searchString(string: string, rule: BlueprintCorrelation): string[] {
        const matches: string[] = [];
        const type: string | undefined = BlueprintCorrelation.getType(rule);
        if(type === BlueprintCorrelationType.boundary) {
            matches.push(...boundarySearch(string, rule));
        } else if(type === BlueprintCorrelationType.regex) {
            matches.push(...regexSearch(string, rule));
        } else if(type === BlueprintCorrelationType.json) {
            matches.push(...jsonSearch(string, rule));
        } else {
            throw new Error(`Unsupported correlation rule type: ${type}`);
        }
        return matches;
    }

    export function computeParamName(paramName: string, indexes: Dict<number>): string {
        const index: number = (isDefined(indexes[paramName]) ? indexes[paramName] : 0) + 1;
        indexes[paramName] = index;
        return paramName + "_" + index;
    }

    function boundarySearch(string: string, rule: BlueprintCorrelation): string[] {
        const matches: string[] = [];

        // defined("string", string);
        // defined("rule", rule);
        // defined("rule.boundary", rule.boundary);

        if(!isDefined(rule.boundary!.left) && !isDefined(rule.boundary!.right)) {
            throw new Error("rule.boundary.left or rule.boundary.right must be defined");
        }

        let lb: string | undefined = rule.boundary!.left?.boundary;
        let rb: string | undefined = rule.boundary!.right?.boundary;
        let lbSearchString: string = string;
        let rbSearchString: string = string;
        
        if(isDefined(lb) && rule.boundary!.left!.ignoreCase) {
            lb = lb!.toLowerCase();
            lbSearchString = lbSearchString.toLowerCase();
        }
        if(isDefined(rb) && rule.boundary!.right!.ignoreCase) {
            rb = rb!.toLowerCase();
            rbSearchString = rbSearchString.toLowerCase();
        }

        if(isDefined(lb) && isDefined(rb)) {
            matches.push(...boundarySearchAux(string, lb!, lbSearchString, rb!, rbSearchString));
        } else if(isDefined(lb)) {
            matches.push(...leftBoundarySearchAux(string, lb!, lbSearchString));
        } else {
            matches.push(...rightBoundarySearchAux(string, rb!, rbSearchString));
        }

        return getOrdinal(matches, rule);
    }

    function boundarySearchAux(string: string, lb: string, lbSearchString: string, rb: string, rbSearchString: string): string[] {
        const matches: string[] = [];
        let startPos: number;
        let leftPos: number = 0;
        let rightPos: number;
        while(true) {
            startPos = matches.length >= 1 ? leftPos + lb.length : 0;
            leftPos = lbSearchString.indexOf(lb, startPos);
            rightPos = leftPos >= 0 ? rbSearchString.indexOf(rb, leftPos + lb.length) : -1;
            if(leftPos < 0 || rightPos < 0)
                break;
            matches.push(string.substring(leftPos + lb.length, rightPos));
        }
        return matches;
    }

    function leftBoundarySearchAux(string: string, lb: string, lbSearchString: string): string[] {
        const matches: string[] = [];
        let startPos: number;
        let leftPos: number = 0;
        while(true) {
            startPos = matches.length >= 1 ? leftPos + lb.length : 0;
            leftPos = lbSearchString.indexOf(lb, startPos);
            if(leftPos < 0)
                break;
            matches.push(string.substring(leftPos + lb.length, lbSearchString.length));
        }
        return matches;
    }

    function rightBoundarySearchAux(string: string, rb: string, rbSearchString: string): string[] {
        const result: string[] = [];
        let startPos: number;
        let rightPos: number = 0;
        while(true) {
            startPos = result.length >= 1 ? rightPos + rb.length : 0;
            rightPos = rbSearchString.indexOf(rb, startPos);
            if(rightPos < 0)
                break;
            result.push(string.substring(0, rightPos));
        }
        return result;
    }

    function regexSearch(string: string, rule: BlueprintCorrelation): string[] {
        const matches: string[] = [];

        // defined("string", string);
        // defined("rule", rule);
        // defined("rule.regex", rule.regex);

        // if(isDefined(rule.ordinal)) {
        //     positive("ordinal", rule.ordinal);
        // }
        // if(isDefined(rule.regex.group)) {
        //     notNegative("regex.group", rule.regex.group);
        // }

        const regex: RegExp = new RegExp(rule.regex!.pattern);
        const count: number = isDefined(rule.ordinal) ? rule.ordinal! : 1;
        const group: number = isDefined(rule.regex!.group) ? rule.regex!.group! : 0;
        
        for(let i = 0; rule.all || rule.last || i < count; i++) {
            const execResults: string[] | null = regex.exec(string);
            if(execResults) {
                if(group === 0 || group <= execResults.length) {
                    matches.push(execResults[group]);
                } else {
                    throw new Error(`Capture group ${group} does not exist`);
                }
            } else {
                break;
            }
        }

        return getOrdinal(matches, rule);
    }

    function jsonSearch(string: string, rule: BlueprintCorrelation): string[] {
        throw new Error("Json search not implemented");
    }

    function getOrdinal(matches: string[], rule: BlueprintCorrelation): string[] {
        if(matches.length < 1) {
            return [];
        } else if(rule.all) {
            return matches;
        } else {
            return matches.slice(matches.length - 1);
        }
    }

}