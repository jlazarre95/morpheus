import { LrRequest } from "./lr-request";
import { LrScriptElement } from "./lr-script-element";

export class LrRequestGroup implements LrScriptElement {
    childRequests: LrRequest[] = [];
    referrerGroupUrl?: string;

    constructor(public parentRequest: LrRequest) { }

    getLastChildRequest(): LrRequest | undefined {
        return this.childRequests.length >= 1 ? this.childRequests[this.childRequests.length - 1] : undefined;
    }

    removeLastChildRequest(): LrRequest | undefined {
        if(this.childRequests.length >= 1) {
            return this.childRequests.pop();
        }
        return undefined;
    }

    toString(): string {
        let str: string = this.parentRequest.toString();
        if(this.childRequests.length >= 1) {
            str += `\tweb_concurrent_start(NULL);\n\n`;
            for(const child of this.childRequests) {
                str += child.toString();
            }
            str += "\tweb_concurrent_end(NULL);\n\n";
        } 
        return str;
    }
}