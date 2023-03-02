# Typescript Simulation

```ts
import { Browser, Page } from "puppeteer";

@Simulation
export class YahooSearchSimulation {

  constructor(@Browser private browser: Browser, @Page private page: Page, @Arg private url: string, @Arg private query: string) {

  }

  @Action
  async goToSearchPage(url: string) {
    await this.page.goto(url);
    await this.page.waitForNetworkIdle();  
    await this.page.screenshot({ path: "homepage.png" });
  }

  @Action
  async searchForQuery(query: string) {
    const searchBox = await this.page.$("#ybar-sbq");
    await searchBox!.type(query);
    await this.page.screenshot({ path: "type.png" });
    await searchBox!.press("Enter");
    await new Promise(r => setTimeout(r, 5000));
    await this.page.screenshot({ path: "results.png" });
  }

}
```