import { BrowserService, LaunchOptions, PressableKey, WaitUntilState, WebElement } from "../browser/browser.service";
import * as Puppeteer from "puppeteer";
import PuppeteerHar from "puppeteer-har";
import { errors } from "puppeteer";
import { ElementNotFoundError } from "../browser/element-not-found.error";
import { sleep } from "../../../util/async.util";

export interface PuppeteerWebElement extends WebElement {
    handle: Puppeteer.ElementHandle<Element>;
}

// export class PuppeteerElementNotFoundError extends ElementNotFoundError {
//     constructor(selector: string, root?: PuppeteerWebElement) {
//         super(selector.indexOf('xpath/') === 0 ? `Element not found: (xpath='${selector.substring(6)}', root='${root?.handle.toString()}')` : `Element not found: (selector='${selector}', root='${root?.handle.toString()}')`);
//         Object.setPrototypeOf(this, PuppeteerElementNotFoundError.prototype);
//     }
// }

export class PuppeteerService implements BrowserService {

    private browser: Puppeteer.Browser;
    private target: Puppeteer.Page | Puppeteer.Frame;
    private targetType: 'page' | 'frame';
    private har: PuppeteerHar;

    async focus(element: PuppeteerWebElement): Promise<void> {
        await element.handle.focus();
    }

    async goBack(timeout?: number, waitUntil?: WaitUntilState[]): Promise<void> {
        await this.getPage().goBack({ timeout, waitUntil });
    }

    async goForward(timeout?: number, waitUntil?: WaitUntilState[]): Promise<void> {
        await this.getPage().goForward({ timeout, waitUntil });
    }

    async hover(element: PuppeteerWebElement): Promise<void> {
        await element.handle.hover();
    }

    async mainFrame(): Promise<void> {
        this.target = await this.getPage().mainFrame();
    }

    async reload(timeout?: number, waitUntil?: WaitUntilState[]): Promise<void> {
        await this.getPage().reload({ timeout, waitUntil });
    }

    async setCacheEnabled(enabled: boolean): Promise<void> {
        await this.getPage().setCacheEnabled(enabled);
    }

    async setDefaultNavigationTimeout(timeout: number): Promise<void> {
        await this.getPage().setDefaultNavigationTimeout(timeout);
    }

    async setDefaultTimeout(timeout: number): Promise<void> {
        await this.getPage().setDefaultTimeout(timeout);
    }

    async setGeoLocation(latitude: number, longitude: number, accuracy?: number): Promise<void> {
        await this.getPage().setGeolocation({ latitude, longitude, accuracy });
    }

    async setJavascriptEnabled(enabled: boolean): Promise<void> {
        await this.getPage().setJavaScriptEnabled(enabled);
    }

    async setOfflineMode(offline: boolean): Promise<void> {
        await this.getPage().setOfflineMode(offline);
    }

    async setUserAgent(userAgent: string): Promise<void> {
        await this.getPage().setUserAgent(userAgent);
    }

    async tap(element: PuppeteerWebElement): Promise<void> {
        await element.handle.tap();
    }

    async waitForFrame(urlOrPredicate: string): Promise<void> {
        await this.getPage().waitForFrame(urlOrPredicate);
    }

    async waitForNavigation(timeout?: number, waitUntil?: WaitUntilState[]): Promise<void> {
        await this.target.waitForNavigation({ timeout, waitUntil });
    }

    async waitForNetworkIdle(idleTime?: number, timeout?: number): Promise<void> {
        await this.getPage().waitForNetworkIdle({ idleTime, timeout });
    }

    async waitForSelector(selector: string, root?: PuppeteerWebElement, options?: { visible?: boolean; hidden?: boolean; timeout?: number; }): Promise<PuppeteerWebElement> {
        let handle;
        try {
            handle = root ? await root.handle.waitForSelector(selector, options) : await this.target.waitForSelector(selector, options);
        } catch(e) {
            if(e instanceof errors.TimeoutError) {
                throw new ElementNotFoundError(`Element not found: (selector='${selector}', root='${root?.handle.toString()}')`);
            }
        }
        if(!handle) {
            throw new ElementNotFoundError(`Element not found: (selector='${selector}', root='${root?.handle.toString()}')`);
        }
        return { handle: handle };
    }

    async clear(element: PuppeteerWebElement): Promise<void> {
        await element.handle.evaluateHandle(element => element.nodeValue = "");
    }

    async click(element: PuppeteerWebElement): Promise<void> {
        await element.handle.click();
    }

    async close(): Promise<void> {
        await this.browser.close();
    }

    async closePage(): Promise<void> {
        await this.getPage().close();
    }

    private async handleContainsElement(handle: Puppeteer.JSHandle<any>): Promise<boolean> {
        try {
            return !!await handle.jsonValue();
        } catch(err: any) {
            if(err.message?.toLowerCase().indexOf('could not serialize referenced object') >= 0)  {
                return true;
            }
            throw err;
        }
    }

    private async isJsonValue(handle: Puppeteer.JSHandle<any>): Promise<boolean> {
        try {
            return !!await handle.jsonValue();
        } catch(err: any) {
            if(err.message?.toLowerCase().indexOf('could not serialize referenced object') >= 0)  {
                return false;
            }
            throw err;
        }    
    }

    async evaluateHandle(pageFunction: string, root?: PuppeteerWebElement): Promise<PuppeteerWebElement> {
        const handle = root ? await root.handle.evaluateHandle(pageFunction) : await this.getPage().evaluateHandle(pageFunction);
        if(!handle || !await this.handleContainsElement(handle)) {
            throw new ElementNotFoundError(`Element not found: (pageFunction='${pageFunction}', root='${root?.handle.toString()}')`);
        }
        if(await this.isJsonValue(handle)) {
            const elem = handle.asElement();
            if(elem) {
                return { handle: elem as Puppeteer.ElementHandle<Element> }
            }
            return { handle: ((await handle.getProperties()).values().next()).value as Puppeteer.ElementHandle<Element> };
        } 
        let nextProp = (await handle.getProperties()).values().next();
        if(nextProp) {
            return { handle: nextProp.value as Puppeteer.ElementHandle<Element> };
        }
        throw new ElementNotFoundError(`Element not found: (pageFunction='${pageFunction}', root='${root?.handle.toString()}')`);
    }

    async goTo(url: string): Promise<void> {
        await this.target.goto(url);
    }

    async findElementBySelector(selector: string, root?: PuppeteerWebElement): Promise<PuppeteerWebElement> {
        const handle = root ? await root.handle.$(selector) : await this.target.$(selector);
        if(!handle) {
            throw new ElementNotFoundError(`Element not found: (selector='${selector}', root='${root?.handle.toString()}')`);
        }
        return { handle: handle };
    }

    async launch(options?: LaunchOptions): Promise<void> {
        const headless: boolean = options?.headless === false ? false : true;
        const args: string[] = options?.args ? options.args : [];
        if(options?.windowSize) {
            args.push(`--window-size=${options.windowSize.width},${options.windowSize.height}`);
        }
        this.browser = await Puppeteer.launch({ headless: headless, args: args, defaultViewport: null });
        this.target = (await this.browser.pages())[0];
        this.targetType = 'page';
    }

    async newPage(): Promise<void> {
        this.target = await this.browser.newPage();
        this.targetType = 'page';
    }

    async press(key: PressableKey, text?: string, element?: PuppeteerWebElement): Promise<void> {
        if(element) {
            await element.handle.press(key as Puppeteer.KeyInput, { text });
        } else {
            await this.getPage().keyboard.press(key as Puppeteer.KeyInput, { text });
        }
    }

    async screenshot(path: string): Promise<void> {
        await this.getPage().screenshot({ path: path });
    }

    async frame(frame: string | number): Promise<void> {
        if(typeof frame === 'string') {
            const f = await this.target.$(`frame[name='${frame}']`);
            const contentFrame: Puppeteer.Frame | null = f ? await f.contentFrame() : null;
            if(!contentFrame) {
                throw new Error(`Could not switch to frame: ${frame}`);
            }
            this.target = contentFrame;
        } else {
            this.target = await this.getPage().frames()[frame];
        }
        this.targetType = 'frame';
    }

    async setWindowSize(width: number, height: number): Promise<void> {
        await this.getPage().setViewport({ width: width, height: height });
    }

    async startHar(path: string): Promise<void> {
        this.har = new PuppeteerHar(this.getPage());
        await this.har.start({ path: path });
    }

    async stopHar(): Promise<void> {
        if(this.har) {
            await this.har.stop();
        }
    }

    async type(keys: string, element?: PuppeteerWebElement): Promise<void> {
        if(element) {
            await element.handle.type(keys);
        } else {
            await this.getPage().keyboard.type(keys);
        }
    }

    private getPage(): Puppeteer.Page {
        return this.targetType === 'page' ? this.target as Puppeteer.Page : (this.target as Puppeteer.Frame).page();
    }

}