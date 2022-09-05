import { PuppeteerService } from "./puppeteer.service";

export class BrowserServiceFactory {

    puppeteer() {
        return new PuppeteerService();
    }

}