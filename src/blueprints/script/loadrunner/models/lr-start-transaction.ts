import { LrScriptElement } from "./lr-script-element";

export class LrStartTransaction implements LrScriptElement {
    constructor(public name: string) { }

    toString(): string {
        return `\tlr_start_transaction("${this.name}");\n\n`;
    }
}
