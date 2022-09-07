import { replaceAll } from "../../../util/string.util";
import { HarRequest, Har, HarHeader, HarPostDataParam } from "../har";
import { RequestFilter } from "../request-filter";
import { SubstitutionFilter, SubstitutionScope } from "./substitution";

export interface SubstituteOptions {
    filters?: SubstitutionFilter[];
    originalRequest?: HarRequest;
}

export namespace Substitutions {

    export function substitute(request: HarRequest, paramName: string, paramValue: string, options: SubstituteOptions = {}) {
        const originalRequest: HarRequest = options.originalRequest || request;
        const filters: SubstitutionFilter[] = options.filters || [];
        if(filters.length < 1) {
            filters.push(new SubstitutionFilter());
        }
        
        for(const filter of filters) {
            const prefix: string = filter.leftBoundary || "";
            const suffix: string = filter.rightBoundary || "";
            const key: string = `${prefix}${paramValue}${suffix}`;
            const value: string = `${prefix}{${paramName}}${suffix}`;
            const scope: SubstitutionScope | undefined = filter.scope;
    
            if(!filter.requestFilter || RequestFilter.match(originalRequest, filter.requestFilter)) {
                // Search the request if there is no request filter or the request filter matches.
                if(!scope || scope === SubstitutionScope.ALL || scope === SubstitutionScope.URL) {
                    request.url = replaceAll(request.url, key, value);
                }
                if(!scope || scope === SubstitutionScope.ALL || scope === SubstitutionScope.HEADERS) {
                    replaceAllInHeaders(request, key, value);
                }
                if(!scope || scope === SubstitutionScope.ALL || scope === SubstitutionScope.BODY) {
                    replaceAllInBody(request, key, value);
                }
            }
        }
    }

    function replaceAllInHeaders(request: HarRequest, key: string, value: string) {
        let str: string = Har.headersToString(request.headers);
        request.headers = [];
        if(str.length >= 1) {
            str = str.substring(1);
            str = replaceAll(str, key, value);
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

    function replaceAllInBody(request: HarRequest, key: string, value: string) {
        if(request.postData.text) {
            request.postData.text = replaceAll(request.postData.text, key, value);
        } else if(request.postData.params) {
            let str: string = "";
            //console.log(request.postData.params);
            for(const param of request.postData.params) {
                str += `&${param.name}=${param.value}`;
            }
            request.postData.params = [];
            if(str.length >= 1) {
                str = str.substring(1);
                //console.log(str.split("&"));
                str = replaceAll(str, key, value);
                //console.log(str);
                for(const token of str.split("&")) {
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