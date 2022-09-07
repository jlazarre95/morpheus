import { LrScriptElement } from "./lr-script-element";

export class LrThinkTime implements LrScriptElement {

    constructor(private seconds: number) { }

    toString() {
        return `\tlr_think_time(${this.seconds});\n\n`;
    }

}