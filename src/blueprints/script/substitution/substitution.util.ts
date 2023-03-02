import { isDefined } from "class-validator";
import { replaceAll, ReplaceAllOptions } from "../../../util/string.util";
import { BlueprintReplaceFilter, BlueprintReplaceFilterScope, BlueprintRequestResponseFilter } from "../../models";
import { Har, HarHeader, HarPostDataParam, HarRequest, HarResponse } from "../har";
import { RequestResponseFilter } from "../request-response-filter";

export interface SubstituteOptions {
    // filters?: SubstitutionFilter[];
    response: HarResponse;
    originalRequest?: HarRequest;
    actions?: string[];
    ignoreCase?: boolean;
    filters?: BlueprintReplaceFilter[];
    occurrences?: Map<BlueprintRequestResponseFilter, number>;
}

export namespace Substitutions {

    export function substitute(request: HarRequest, paramName: string, paramValue: string, options: SubstituteOptions) {
        const { originalRequest = request, actions, response, filters = [], occurrences, ignoreCase } = options;
        if(filters.length < 1) {
            filters.push({});
        }
        for(const filter of filters) {
            const prefix: string = filter.boundary?.left?.boundary || "";
            const suffix: string = filter.boundary?.right?.boundary || "";
            const key: string = `${prefix}${paramValue}${suffix}`;
            const value: string = `${prefix}{${paramName}}${suffix}`;
            const scope: BlueprintReplaceFilterScope | undefined = filter.scope;
            const replaceAllOptions: ReplaceAllOptions = { ignoreCase: isDefined(filter.ignoreCase) ? filter.ignoreCase : ignoreCase };

            if(!filter.requestResponse || RequestResponseFilter.match(originalRequest, response, filter.requestResponse, { actions, occurrences })) {
                // Search the request if there is no request filter or the request filter matches.
                const all: boolean = !scope || scope === BlueprintReplaceFilterScope.all;
                if(all || scope === BlueprintReplaceFilterScope.url) {
                    request.url = replaceAll(request.url, key, value, replaceAllOptions);
                }
                if(all || scope === BlueprintReplaceFilterScope.headers) {
                    replaceAllInHeaders(request, key, value, replaceAllOptions);
                }
                if(all || scope === BlueprintReplaceFilterScope.body) {
                    replaceAllInBody(request, key, value, replaceAllOptions);
                }
            }
        }
    }

    function replaceAllInHeaders(request: HarRequest, key: string, value: string, options: ReplaceAllOptions) {
        let str: string = Har.headersToString(request.headers);
        request.headers = [];
        if(str.length >= 1) {
            str = str.substring(1);
            str = replaceAll(str, key, value, options);
            for(const token of str.split("\n")) {
                const index: number = token.indexOf(": ");
                const headerName: string = token.substring(0, index);
                const headerValue: string = token.substring(index + 2);
                //console.log(`NAME: '${headerName}'`, `VALUE: '${headerValue}'`);
                const header: HarHeader = new HarHeader();
                header.name = headerName;
                header.value = headerValue;
                request.headers.push(header);
            }
        }
    }

    function replaceAllInBody(request: HarRequest, key: string, value: string, options: ReplaceAllOptions) {
        if(request.postData.text) {
            const body: string = Har.getRequestBody(request);
            request.postData.text = replaceAll(body, key, value, options);
        } else if(request.postData.params) {
            let body: string = Har.getRequestBody(request);
            request.postData.params = [];
            if(body.length >= 1) {
                //console.log(body.split("&"));
                body = replaceAll(body, key, value, options);
                //console.log(body);
                for(const token of body.split("&")) {
                    const index: number = token.indexOf("=");
                    const paramName: string = token.substring(0, index);
                    const paramValue: string = token.substring(index + 1);
                    //console.log(`NAME: '${paramName}'`, `VALUE: '${paramValue}'`);
                    const param: HarPostDataParam = new HarPostDataParam();
                    param.name = paramName;
                    param.value = paramValue;
                    request.postData.params.push(param);
                }
            } 
        }
    }

}