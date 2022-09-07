// import * as Puppeteer from "puppeteer";

// @Actions
// export class GoogleSearchActions {
//     constructor(@PuppeteerPage private page: Puppeteer.Page) { }

//     @Action('Search')
//     async search(@Arg query: string) {
//         const elem = await this.page.waitForSelector('input[name=q]', { timeout: 5000 });
//         await elem!.type(query);
//         await this.page.screenshot({ path: 'type.png' });
//         await elem!.press('Enter');
//         await this.page.screenshot({ path: 'results.png' });
//     }

//     @Action('Click Images')
//     async clickImages() {
//         const elem = await this.page.waitForSelector(`//a[contains(text(), 'Images')]`, { timeout: 5000 });
//         await elem!.click();
//     }
// }