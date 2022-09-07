import { matchWildcardPattern } from "../../util/string.util";
import { HarRequest } from "./har";

export class MatchOptions {
    requestTransaction?: string;
}

export class RequestFilter {
    url?: string;
    excludeUrl?: string;
    method?: string;
    transaction?: string;
}

export namespace RequestFilter {

    export function match(request: HarRequest, filter: RequestFilter, options: MatchOptions = {}) {
        return matchUrl(request, filter) && matchMethod(request, filter) && matchTransaction(request, filter, options);
    }

    function matchUrl(request: HarRequest, filter: RequestFilter): boolean {
        // Return true if filter url and exclude url is not provided.
        if(!filter.url && !filter.excludeUrl)
            return true;

        if(filter.url) {
            // Return false if url does not match request url.
            if(!matchWildcardPattern(request.url, filter.url))
                return false;
        }

        // Return true if url is not excluded; otherwise, return false.
        const urlExcluded = filter.excludeUrl && matchWildcardPattern(request.url, filter.excludeUrl);
        return !urlExcluded;
    }

    function matchMethod(request: HarRequest, filter: RequestFilter): boolean {
        return !filter.method || request.method.toLowerCase() === filter.method.toLowerCase();
    }

    function matchTransaction(request: HarRequest, filter: RequestFilter, options: MatchOptions): boolean {
        const transactionName: string = options.requestTransaction || "";
        return !filter.transaction || matchWildcardPattern(transactionName, filter.transaction);
    }

}