import { LrScriptElement } from "./lr-script-element";

export class LrEndTransaction implements LrScriptElement {
    constructor(public name: string) { }

    toString(): string {
        return `\tlr_end_transaction("${this.name}", LR_AUTO);\n\n`;
    }
}
