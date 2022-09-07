// import * as Puppeteer from "puppeteer";
// import { GoogleSearchActions } from "./google-search.actions";

// @Simulation
// export class GoogleImageSearchSimulation {

//     @PuppeteerBrowser browser: Puppeteer.Browser;
//     @PuppeteerPage page: Puppeteer.Page;
//     @Actions google: GoogleSearchActions;

//     @Arg url: string;
//     @Arg query: string;

//     @Action
//     async hitServer() {
//         await this.page.goto(this.url);
//         await this.page.screenshot({ path: 'homepage.png' });
//     }

//     @Action
//     async search() {
//         const elem = await this.page.waitForSelector('input[name=q]', { timeout: 5000 });
//         await elem!.type('cats');
//         await this.page.screenshot({ path: 'type.png' });
//         await elem!.press('Enter');
//         await this.page.screenshot({ path: 'results.png' });
//     }

//     @Action
//     async clickImages() {
//         const elem = await this.page.waitForSelector(`//a[contains(text(), 'Images')]`, { timeout: 5000 });
//         await elem!.click();
//         await this.page.screenshot({ path: 'images.png' });
//     }

//     // @Init
//     // async init() {

//     // }

//     // @End
//     // async end() {
        
//     // }

//     // @Actions actions: RecordedActions;
//     // @Action({ unnamed: true })
//     // async main() {
//     //     this.actions.start('Hit Server')
//     //     await this.hitServer();
//     //     this.actions.end();

//     //     this.actions.start('Search');
//     //     await this.search();
//     //     this.actions.end();

//     //     this.actions.start('Click Images');
//     //     await this.clickImages();
//     //     this.actions.end();
//     // }

// }