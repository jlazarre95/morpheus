import { suite, test, timeout } from "@testdeck/mocha";
import { createBlueprint, loadBlueprintFile } from "..";
import * as V1 from "../v1";
import { BrowserServiceFactory } from "./browser/browser-service-factory";
import { SimulationService } from "./simulation.service";

@suite
export class SimulationServiceTest {

    simulationService: SimulationService;
    readonly headless: boolean = false;

    before() {
        this.simulationService = new SimulationService(new BrowserServiceFactory());
    }

    @test
    @timeout(60_000)
    async testSimulateGoogleImageSearch() {
        const manifestObj: any = await loadBlueprintFile('test/fixtures/google-image-search.blueprint.yaml');
        const manifest: V1.BlueprintManifest = await createBlueprint(manifestObj, '1', { args: { query: { value: "cats" } } });
        await this.simulationService.simulate(manifest, { headless: this.headless, windowSize: { width: 1280, height: 720 }, outputDir: 'tmp/google', profile: "test" });
    }

    @test
    @timeout(60_000)
    async testSimulateYahooSearch() {
        const manifestObj: any = await loadBlueprintFile('test/fixtures/yahoo-search.blueprint.yaml');
        const manifest: V1.BlueprintManifest = await createBlueprint(manifestObj, '1', { args: { query: { value: "dogs" } } });
        await this.simulationService.simulate(manifest, { headless: this.headless, windowSize: { width: 1280, height: 720 }, outputDir: 'tmp/yahoo', profile: "test" });
    }

}