import { isDefined } from "class-validator";
import { accept, grant } from "../../util";
import { matchString } from "../../util/string.util";
import { isBetween } from "../../validation";
import { BlueprintRequestResponseFilter, BlueprintRequestResponseFilterTarget } from "../models";
import { Har, HarRequest, HarResponse } from "./har";

export class MatchOptions {
    actions?: string[];
    occurrences?: Map<BlueprintRequestResponseFilter, number>;
}

export namespace RequestResponseFilter {

    export function match(request: HarRequest, response: HarResponse, filter: BlueprintRequestResponseFilter, options: MatchOptions = {}): boolean {
        return matchMethod(request, filter) 
            && matchUrl(request, filter) 
            && matchHeaders(request, response, filter) 
            && matchBody(request, response, filter) 
            && matchStatus(response, filter) 
            && matchAction(filter, options)
            && matchOccurrences(filter, options);
    }

    function matchMethod(request: HarRequest, filter: BlueprintRequestResponseFilter): boolean {
        if(!filter.method) {
            return true;
        }
        const acceptList = filter.method.filter(m => !m.exclude).map(m => m.method.toLowerCase());
        const denyList = filter.method.filter(m => m.exclude).map(m => m.method.toLowerCase());
        return accept(request.method.toLowerCase(), acceptList, denyList);
    }

    function matchUrl(request: HarRequest, filter: BlueprintRequestResponseFilter): boolean {
        return filter.url ? matchString(request.url, filter.url.url, filter.url.regex) === !filter.url.exclude : true;
    }

    function matchHeaders(request: HarRequest, response: HarResponse, filter: BlueprintRequestResponseFilter): boolean {
        if(!filter.headers) {
            return true;
        }

        const headers: string[] = [];
        const all: boolean = !filter.target || filter.target == BlueprintRequestResponseFilterTarget.all;
        if(all || filter.target === BlueprintRequestResponseFilterTarget.request) {
            headers.push(Har.headersToString(request.headers));
        }
        if(all || filter.target === BlueprintRequestResponseFilterTarget.response) {
            headers.push(Har.headersToString(response.headers));
        }

        for(const headersStr of headers) {
            const matches: boolean = matchString(headersStr, filter.headers.headers, filter.headers.regex);
            if(matches && !filter.headers.exclude) {
                return true;
            } else if(matches && filter.headers.exclude) {
                return false;
            }
        }

        return filter.headers.exclude == true;
    }

    function matchBody(request: HarRequest, response: HarResponse, filter: BlueprintRequestResponseFilter): boolean {
        if(!filter.body) {
            return true;
        }

        const bodies: string[] = [];
        const all: boolean = !filter.target || filter.target == BlueprintRequestResponseFilterTarget.all;
        if(all || filter.target === BlueprintRequestResponseFilterTarget.request) {
            bodies.push(request.getBody());
        }
        if(all || filter.target === BlueprintRequestResponseFilterTarget.response) {
            bodies.push(response.getBody());
        }
        for(const body of bodies) {
            const matches: boolean = matchString(body, filter.body.body, filter.body.regex);
            if(matches && !filter.body.exclude) {
                return true;
            } else if(matches && filter.body.exclude) {
                return false;
            }
        }

        return filter.body.exclude == true;
    }

    function matchStatus(response: HarResponse, filter: BlueprintRequestResponseFilter): boolean {
        if(!filter.status) {
            return true;
        }
        const acceptList = filter.status.filter(m => !m.exclude);
        const denyList = filter.status.filter(m => m.exclude);
        return grant(response.status, acceptList, denyList, (status, range) => { 
            const min: number = range.from;
            const max: number = isDefined(range.to) ? range.to! : range.from;
            return isBetween(status, { min, max });
        });
    }

    function matchAction(filter: BlueprintRequestResponseFilter, options: MatchOptions): boolean {
        if(!filter.action) {
            return true;
        }

        const actions: string[] = options.actions || [];
        for(const action of actions) {
            const matches: boolean = matchString(action, filter.action.action, filter.action.regex);
            if(matches && !filter.action.exclude) {
                return true;
            } else if(matches && filter.action.exclude) {
                return false;
            }
        }

        return filter.action.exclude == true;
    }

    function matchOccurrences(filter: BlueprintRequestResponseFilter, options: MatchOptions): boolean {
        let match: boolean = false;
        if(!filter.occurrences) {
            match = true;
        } else {
            const occurrence: number = getOccurrence(filter, options) + 1;
            const acceptList = filter.occurrences.filter(m => !m.exclude);
            const denyList = filter.occurrences.filter(m => m.exclude);
            match = grant(occurrence, acceptList, denyList, (o, range) => { 
                const min: number = range.from;
                const max: number = isDefined(range.to) ? range.to! : range.from;
                return isBetween(o, { min, max });
            });
        }
        if(match) {
            incrementOccurrences(filter, options);
        }
        return match;
    }

    function getOccurrence(filter: BlueprintRequestResponseFilter, options: MatchOptions) {
        if(options.occurrences) {
            const occurrences: number = options.occurrences.get(filter) ? options.occurrences.get(filter)! : 0;
            return occurrences;
        }
        return 0;
    }

    function incrementOccurrences(filter: BlueprintRequestResponseFilter, options: MatchOptions) {
        if(options.occurrences) {
            const occurrences: number = getOccurrence(filter, options);
            options.occurrences.set(filter, occurrences + 1);
        }
    }
}

