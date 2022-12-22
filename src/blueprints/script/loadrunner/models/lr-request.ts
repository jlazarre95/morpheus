import { isDefined } from "class-validator";

import { parse, Url } from "url";
import { indent, createComment, escapeString } from "../../../../util/string.util";
import { BlueprintCorrelation, BlueprintCorrelationType, BlueprintExcludeHeader } from "../../../models";
import { MatchedCorrelationRule } from "../../correlation/matched-correlation-rule";
import { HarRequest, HarResponse, Har } from "../../har";
import { includeHeader } from "../../util/script.util";
import { LrScriptElement } from "./lr-script-element";

export class LrRequest implements LrScriptElement {

    private matchedCorrelations: MatchedCorrelationRule[] = [];

    constructor(private request: HarRequest, private response: HarResponse, private index: number, 
                private excludeHeaders?: BlueprintExcludeHeader[]) { 

    }

    getMatchedCorrelations(): MatchedCorrelationRule[] {
        return this.matchedCorrelations;
    }

    addMatchedCorrelations(...rules: MatchedCorrelationRule[]) {
        this.matchedCorrelations.push(...rules);
    }

    toString(): string {
        const name: string = this.getRequestName(this.request);
        const webRegSaveParams: string = this.stringifyWebRegSaveParams(this.matchedCorrelations);
        const headers: string = this.stringifyHeaders(this.request);
        const url: string = this.request.url;
        const method: string = this.request.method.toUpperCase();
        const resource: number = ["text/html", "application/json"].indexOf(this.response.content.mimeType.toLowerCase()) >= 0 ? 0 : 1;
        const recContentType: string = this.response.content.mimeType;
        const encContentType: string | undefined = Har.getHeaderValue("content-type", this.request.headers);
        const referrer: string | undefined = Har.getHeaderValue("referer", this.request.headers);
        const snapshot: string = this.index + 1 + "";
        const requestMode: string = "HTTP";
        
        let str: string = `${webRegSaveParams}${headers}\tweb_custom_request("${name}",\n`
            + `\t\t"URL=${url}",\n`
            + `\t\t"Method=${method}",\n`
            + `\t\t"Resource=${resource}",\n`
            + `\t\t"RecContentType=${recContentType}",\n`;

        if(referrer) {
            str += `\t\t"Referer=${referrer}",\n`
        }

        str += `\t\t"Snapshot=${snapshot}",\n`
            + `\t\t"Mode=${requestMode}",\n`;
    
        if(["POST", "PUT", "PATCH", "DELETE"].indexOf(method) >= 0) {
            const body: string = this.stringifyBody(this.request);
            str += `\t\t"EncType=${encContentType}",\n${body}`;
        } 

        const webConvertParams: string = this.stringifyWebConvertParams(this.matchedCorrelations);
        str += `\t\tLAST);\n\n${webConvertParams}`;
        return str;
    }

    private getRequestName(request: HarRequest): string {
        const url: Url = parse(request.url);
        const name: string = url.pathname!.substring(url.pathname!.lastIndexOf("/") + 1);
        return name.trim() === "" ? decodeURIComponent(url.path!.substring(0, url.path!.indexOf("/"))) : name;
    }

    private stringifyWebRegSaveParams(matchedCorrelations: MatchedCorrelationRule[]): string {
        let str: string = "";
        for(const matchedCorrelation of matchedCorrelations) {    
            // Add apply rule comment
            const commentString: string = "APPLY RULE: " + JSON.stringify({ 
                type: "correlation", 
                name: matchedCorrelation.rule.name, 
                capturedValues: matchedCorrelation.paramValues 
            }, null);
            str += indent(createComment(commentString));
            
            // Add web_reg_save_param
            switch (BlueprintCorrelation.getType(matchedCorrelation.rule)) {
                case BlueprintCorrelationType.boundary:
                    const lbKey: string = "LB" + (matchedCorrelation.rule.boundary!.left?.ignoreCase ? "/" + "IC" : "");
                    const rbKey: string = "RB" + (matchedCorrelation.rule.boundary!.right?.ignoreCase ? "/" + "IC" : ""); 
                    const lb: string | undefined = matchedCorrelation.rule.boundary!.left?.boundary;
                    const rb: string | undefined = matchedCorrelation.rule.boundary!.right?.boundary; 
                    str += "\tweb_reg_save_param_ex(\n"
                        + this.stringifyArg("ParamName", matchedCorrelation.paramName)
                        + this.stringifyArg(lbKey, lb ? escapeString(lb!) : undefined)
                        + this.stringifyArg(rbKey, rb ? escapeString(rb!) : undefined)
                        + this.stringifyWebRegSaveParamAttributes(matchedCorrelation)
                        + this.stringifyWebRegSaveParamSearchFilters(matchedCorrelation)
                        + "\t\tLAST);";
                    break;
                case BlueprintCorrelationType.regex:
                    str += "\tweb_reg_save_param_regexp(\n"
                        + this.stringifyArg("ParamName", matchedCorrelation.paramName)
                        + this.stringifyArg("RegExp", escapeString(matchedCorrelation.rule.regex!.pattern))
                        + this.stringifyArg("Group", matchedCorrelation.rule.regex!.group)
                        + this.stringifyWebRegSaveParamAttributes(matchedCorrelation)
                        + this.stringifyWebRegSaveParamSearchFilters(matchedCorrelation)
                        + "\t\tLAST);";
                    break;
                default:
                    throw new Error(`Unknown correlation rule type: ${BlueprintCorrelation.getType(matchedCorrelation.rule)}`);
            }
            str += "\n\n";
        }
        return str;
    }

    private stringifyHeaders(request: HarRequest): string {
        let str: string = "";
        for(const header of request.headers) {
            if(includeHeader(header.name, request, this.excludeHeaders!)) {
                str += `\tweb_add_header("${header.name}", "${header.value}");\n\n`;
            }
        }
        return str;
    }

    private stringifyBody(request: HarRequest): string {
        const hasBody: boolean = !!request.postData && (!!request.postData.text || (!!request.postData.params 
            && request.postData.params.length >= 1));
        let body: string;
        if(!hasBody) {
            body = "";
        } else if(request.postData.params || Har.getHeaderValue("content-type", request.headers) === "application/x-www-form-urlencoded") {
            body = `\t\t"Body="\n`;
            for(const param of request.postData.params) {
                body += `\t\t"${param.name}=${escapeString(param.value)}&"\n`;
            }
            body = body.substring(0, body.length - 3) + `",\n`;
        } else {
            body = `\t\t"Body=${escapeString(request.postData.text)}",\n`;
        }
        return body;
    }

    private stringifyWebConvertParams(matchedCorrelations: MatchedCorrelationRule[]): string {
        let str: string = "";
        for(const correlation of matchedCorrelations) {
            str += `\tweb_convert_param("${correlation.paramName}", "SourceEncoding=HTML", "TargetEncoding=URL", LAST);\n\n`;
        }
        return str;
    }

    private stringifyArg(key: string, value: any, useComma: boolean = true): string {
        if(isDefined(value)) {
            return `\t\t"${key}=${value}"${useComma ? "," : ""}\n`;
        }
        return "";
    }

    private stringifyWebRegSaveParamAttributes(matchedCorrelation: MatchedCorrelationRule): string { 
        let str: string = "";
        if(isDefined(matchedCorrelation.rule.ordinal)) {
            str += this.stringifyArg("Ordinal", matchedCorrelation.rule.ordinal);
        } else if(isDefined(matchedCorrelation.rule.all)) {
            str += this.stringifyArg("Ordinal", "All");
        } else if(isDefined(matchedCorrelation.rule.last)) {
            str += this.stringifyArg("Ordinal", "Last");
        }
        return str;
    }

    private stringifyWebRegSaveParamSearchFilters(matchedCorrelation: MatchedCorrelationRule): string { 
        let str: string = "";
        if(this.containsSearchFilters(matchedCorrelation)) {
            str += `\t\tSEARCH_FILTERS,\n`;
            if(isDefined(matchedCorrelation.rule.scope)) {
                str += this.stringifyArg("Scope", matchedCorrelation.rule.scope!.charAt(0).toUpperCase() + matchedCorrelation.rule.scope!.substring(1));
            } else if(isDefined(matchedCorrelation.rule.url)) {
                str += this.stringifyArg("RequestUrl", matchedCorrelation.rule.url);
            } 
        }
        return str;
    }

    private containsSearchFilters(matchedCorrelation: MatchedCorrelationRule): boolean {
        return isDefined(matchedCorrelation.rule.scope) || isDefined(matchedCorrelation.rule.url);
    }

}
