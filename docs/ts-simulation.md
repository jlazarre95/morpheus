# Typescript Simulation

```ts
import { Browser, Page } from "puppeteer";
import { Action, Arg, PuppeteerSimulation, Simulation } from "morpheus";

@Simulation
export class YahooSearchSimulation extends PuppeterSimulation {

  @Arg url: string;
  @Arg query: string;

  @Action
  async goToSearchPage() {
    await this.page.goto(url);
    await this.page.waitForNetworkIdle();  
    await this.page.screenshot({ path: "homepage.png" });
  }

  @Action
  async searchForQuery() {
    const searchBox = await this.page.$("#ybar-sbq");
    await searchBox.type(query);
    await this.page.screenshot({ path: "type.png" });
    await searchBox.press("Enter");
    await this.think(5000);
    await this.page.screenshot({ path: "results.png" });
  }

}
```