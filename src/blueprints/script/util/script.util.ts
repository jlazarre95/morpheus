import { matchWildcardPattern } from "../../../util/string.util";
import { BlueprintExcludeHeader, BlueprintExcludeUrl } from "../../models";
import { HarRequest } from "../har";

export const DEFAULT_EXCLUDED_HEADERS = [
    "accept",
    "accept-encoding",
    "accept-language",
    "cache-control",
    "connection",
    "content-length",
    "content-type",
    "cookie",
    "host",
    "referer",
    "referrer",
    "x-requested-with",
    "upgrade-insecure-requests",
    "user-agent"
];

export function includeUrl(request: HarRequest, rules: BlueprintExcludeUrl[]): boolean {
    for(const rule of rules) {
        const urlPattern: string | undefined = rule.url ? rule.url.toLowerCase() : undefined;
        if(matchWildcardPattern(request.url.toLowerCase(), urlPattern)) {
            return false;
        }
    }
    return true;
}

export function includeHeader(name: string, request: HarRequest, rules: BlueprintExcludeHeader[]): boolean {
    for(const rule of rules) {
        const urlPattern: string | undefined = rule.url ? rule.url.toLowerCase() : undefined;
        const headerNamePattern: string = rule.header.toLowerCase();
        if(matchWildcardPattern(request.url.toLowerCase(), urlPattern) && matchWildcardPattern(name.toLowerCase(), headerNamePattern)) {
            return false;
        }
    }
    return true;
}

