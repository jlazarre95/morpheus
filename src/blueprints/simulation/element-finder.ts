import { BrowserService, WebElement } from "./browser/browser.service";
import { ElementNotFoundError } from "./browser/element-not-found.error";
import { Dict } from "../../types/dict";

export class ElementFinder {

    private elements: Dict<WebElement> = {};

    constructor(private browser: BrowserService) {

    }

    async find(selector: string, root: string | undefined, safe: true): Promise<WebElement | undefined>;
    async find(selector: string, root: string | undefined, safe?: boolean): Promise<WebElement>;

    async find(selector: string, root: string | undefined, safe: boolean = false): Promise<WebElement | undefined> {
        try {
            if (!root) {
                return await this.findElement(selector);
            }
            let rootElement: WebElement = await this.findElement(root);
            return await this.browser.findElementBySelector(selector, rootElement);
        } catch(err) {
            if(safe && err instanceof ElementNotFoundError) {
                return undefined;
            }
            throw err;
        }
    }

    async waitFor(selector: string, root: string | undefined, options: { visible?: boolean, hidden?: boolean, timeout?: number } | undefined, safe: true): Promise<WebElement | undefined>;
    async waitFor(selector: string, root: string | undefined, options: { visible?: boolean, hidden?: boolean, timeout?: number } | undefined, safe?: boolean): Promise<WebElement>;
    
    async waitFor(selector: string, root?: string, options: { visible?: boolean, hidden?: boolean, timeout?: number } = {}, safe: boolean = false): Promise<WebElement | undefined> {
        try {
            const rootElem: WebElement | undefined = root ? await this.find(root, undefined) : undefined;
            return await this.browser.waitForSelector(selector, rootElem, options);
        } catch(err) {
            if(safe && err instanceof ElementNotFoundError) {
                return undefined;
            }
            throw err;
        }
    }

    // TODO: validate name has no conflicts with selector or xpath name conventions
    async save(name: string, element: WebElement) {
        this.elements[name] = element;
    }

    private async findElement(selector: string): Promise<WebElement> {
        if(this.elements[selector]) {
            return Promise.resolve(this.elements[selector]);
        }
        return await this.browser.findElementBySelector(selector);
    }


}

