import { mkdirp } from "fs-extra";
import { join } from "path";
import { ElementFinder } from "./element-finder";
import { sleep } from "../../util/async.util";
import { BrowserService, WaitUntilState, WebElement } from "./browser/browser.service";
import { BlueprintImportRange } from "../v1";

export class CommandProcessor {
    
    constructor(private browser: BrowserService, private elementFinder: ElementFinder) {

    }

    async clear(selector: string, root?: string) {
        const e: WebElement = await this.elementFinder.find(selector, root);
        await this.browser.clear(e);
    }   

    async click(selector: string, root?: string) {
        const e: WebElement = await this.elementFinder.find(selector, root);
        await this.browser.click(e);
    }

    async close() {
        await this.browser.close();
    }

    async closePage() {
        await this.browser.closePage();
    }

    async evaluateHandle(pageFunction: string, root?: string, saveAs?: string) {
        const rootElem: WebElement | undefined = root ? await this.elementFinder.find(root, undefined, true) : undefined;
        const e: WebElement = await this.browser.evaluateHandle(pageFunction, rootElem);
        if(saveAs) {
            await this.elementFinder.save(saveAs, e);
        }
    }

    async find(selector: string, root?: string, saveAs?: string) {
        const e: WebElement = await this.elementFinder.find(selector, root);
        if(saveAs) {
            await this.elementFinder.save(saveAs, e);
        }
    }

    async focus(selector: string, root?: string) {
        const e: WebElement = await this.elementFinder.find(selector, root);
        await this.browser.focus(e);
    }

    async goBack(timeout?: number, waitUntil?: WaitUntilState[]) {
        await this.browser.goBack(timeout, waitUntil);
    }

    async goForward(timeout?: number, waitUntil?: WaitUntilState[]) {
        await this.browser.goForward(timeout, waitUntil);
    }

    async goTo(url: string) {
        await this.browser.goTo(url);
    }   

    async frame(frame: string | number) {
        await this.browser.frame(frame);
    }   

    async hover(selector: string, root?: string) {
        const e: WebElement = await this.elementFinder.find(selector, root);
        await this.browser.hover(e);
    }   

    async import(name: string, ranges?: BlueprintImportRange[]) {
        throw new Error("Method not implemented.");
    }

    log(message: string) {
        console.log(message);
    }

    async mainFrame() {
        await this.browser.mainFrame();
    }   

    async newPage() {
        await this.browser.newPage();
    }   

    async press(key: string, text?: string, selector?: string, root?: string) {
        const e: WebElement | undefined = selector ? await this.elementFinder.find(selector, root) : undefined;
        await this.browser.press(key, text, e);
    }

    async reload(timeout?: number, waitUntil?: WaitUntilState[]) {
        await this.browser.reload(timeout, waitUntil);
    }  

    async screenshot(dirPath: string, name: string) {
        await mkdirp(dirPath);
        await this.browser.screenshot(join(dirPath, name));
    }

    async setCacheEnabled(enabled: boolean) {
        await this.browser.setCacheEnabled(enabled);
    } 

    async setDefaultNavigationTimeout(timeout: number) {
        await this.browser.setDefaultNavigationTimeout(timeout);
    } 

    async setDefaultTimeout(timeout: number) {
        await this.browser.setDefaultTimeout(timeout);
    } 

    async setGeoLocation(latitude: number, longitude: number, accuracy?: number) {
        await this.browser.setGeoLocation(latitude, longitude, accuracy);
    } 

    async setJavascriptEnabled(enabled: boolean) {
        await this.browser.setJavascriptEnabled(enabled);
    } 

    async setOfflineMode(enabled: boolean) {
        await this.browser.setOfflineMode(enabled);
    } 

    async setUserAgent(userAgent: string) {
        await this.browser.setUserAgent(userAgent);
    } 

    async setWindowSize(width: number, height: number) {
        await this.browser.setWindowSize(width, height);
    }

    async tap(selector: string, root?: string) {
        const e: WebElement = await this.elementFinder.find(selector, root);
        await this.browser.tap(e);
    } 

    async type(text: string, selector?: string, root?: string) {
        const e: WebElement | undefined = selector ? await this.elementFinder.find(selector, root) : undefined;
        await this.browser.type(text, e);
    }

    async wait(ms?: number) {
        if (ms) {
            console.log(`Waiting for ${ms} milliseconds`);
            await sleep(ms);
        }
    }

    async waitForFrame(urlOrPredicate: string) {
        await this.browser.waitForFrame(urlOrPredicate);
    } 

    async waitForNavigation(timeout?: number, waitUntil?: WaitUntilState[]) {
        await this.browser.waitForNavigation(timeout, waitUntil);
    }

    async waitForNetworkIdle(idleTime?: number, timeout?: number) {
        await this.browser.waitForNetworkIdle(idleTime, timeout);
    }

    async waitFor(selector: string, root?: string, options?: { visible?: boolean, hidden?: boolean, timeout?: number }, saveAs?: string) {
        const elem: WebElement = await this.elementFinder.waitFor(selector, root, options);
        if(saveAs) {
            await this.elementFinder.save(saveAs, elem);
        }
    } 
    
}