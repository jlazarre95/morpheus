import { suite, test, timeout } from "@testdeck/mocha";
import { loadBlueprint } from "..";
import { BlueprintManifest } from "../models";
import { BrowserServiceFactory } from "./browser/browser-service-factory";
import { SimulationService } from "./simulation.service";

@suite
export class SimulationServiceTest {

    simulationService: SimulationService;
    readonly headless: boolean = true;

    before() {
        this.simulationService = new SimulationService(new BrowserServiceFactory());
    }

    @test
    @timeout(60_000)
    async testSimulateGoogleImageSearch() {
        let manifest: BlueprintManifest = await loadBlueprint('test/fixtures/google/google-image-search.blueprint.yaml', { args: { query: { value: "cats" } } });
        await this.simulationService.simulate(manifest, { headless: this.headless, windowSize: { width: 1280, height: 720 }, outputDir: 'tmp/google', profile: "test" });
    }

    @test
    @timeout(60_000)
    async testSimulateYahooSearch() {
        let manifest: BlueprintManifest = await loadBlueprint('test/fixtures/yahoo/yahoo-search.blueprint.yaml', { args: { query: { value: "dogs" } } });
        await this.simulationService.simulate(manifest, { headless: this.headless, windowSize: { width: 1280, height: 720 }, outputDir: 'tmp/yahoo', profile: "test" });
    }

}