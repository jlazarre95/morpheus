import { KeyInput, PuppeteerLifeCycleEvent } from "puppeteer";

export interface WebElement {
}

export interface LaunchOptionsWindowSize {
    width: number;
    height: number;
}

export interface LaunchOptions {
    headless?: boolean;
    windowSize?: LaunchOptionsWindowSize;
    args?: string[];
}

export type PressableKey = KeyInput | string;
export type WaitUntilState = PuppeteerLifeCycleEvent;

export interface BrowserService {
    clear(element: WebElement): Promise<void>;
    click(element: WebElement): Promise<void>;
    close(): Promise<void>;
    closePage(): Promise<void>;
    findElementBySelector(selector: string, root?: WebElement): Promise<WebElement>;
    focus(element: WebElement): Promise<void>;
    goBack(timeout?: number, waitUntil?: WaitUntilState[]): Promise<void>;
    goForward(timeout?: number, waitUntil?: WaitUntilState[]): Promise<void>;
    goTo(url: string): Promise<void>;
    frame(frame: string | number): Promise<void>;
    hover(element: WebElement): Promise<void>;
    launch(options?: LaunchOptions): Promise<void>;
    mainFrame(): Promise<void>;
    newPage(): Promise<void>;
    press(key: PressableKey, text?: string, element?: WebElement): Promise<void>;
    reload(timeout?: number, waitUntil?: WaitUntilState[]): Promise<void>;
    screenshot(path: string): Promise<void>;
    setCacheEnabled(enabled: boolean): Promise<void>;
    setDefaultNavigationTimeout(timeout: number): Promise<void>;
    setDefaultTimeout(timeout: number): Promise<void>;
    setGeoLocation(latitude: number, longitude: number, accuracy?: number): Promise<void>;
    setJavascriptEnabled(enabled: boolean): Promise<void>;
    setOfflineMode(offline: boolean): Promise<void>;
    setUserAgent(userAgent: string): Promise<void>;
    setWindowSize(width: number, height: number): Promise<void>;
    startHar(path: string): Promise<void>;
    stopHar(): Promise<void>;   
    tap(element: WebElement): Promise<void>;
    type(keys: string, element?: WebElement): Promise<void>;
    waitForFrame(urlOrPredicate: string): Promise<void>;
    waitForNavigation(timeout?: number, waitUntil?: WaitUntilState[]): Promise<void>;
    waitForNetworkIdle(idleTime?: number, timeout?: number): Promise<void>;
    waitForSelector(selector: string, root?: WebElement, options?: { visible?: boolean, hidden?: boolean, timeout?: number }): Promise<WebElement>;
}