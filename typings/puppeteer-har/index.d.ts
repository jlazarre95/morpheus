declare module 'puppeteer-har' {
  import { Page } from "puppeteer";

  class PuppeteerHar {
    constructor(page: Page);
    start(options?: StartOptions): Promise<void>;
    stop(): Promise<Object | undefined>;
  }

  namespace PuppeteerHar {
    export interface StartOptions {
      path: string;
    }
  }

  export = PuppeteerHar;

} 