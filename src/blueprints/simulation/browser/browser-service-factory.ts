import { PuppeteerService } from "../puppeteer/puppeteer.service";

export class BrowserServiceFactory {

    puppeteer() {
        return new PuppeteerService();
    }

}