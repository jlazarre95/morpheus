import { suite, test, timeout } from "@testdeck/mocha";
import { load } from "../blueprints";
import * as V1 from "../blueprints/v1";
import { BrowserServiceFactory } from "./browser/browser-service-factory";
import { SimulationService } from "./simulation.service";

@suite
export class SimulationServiceTest {

    simulationService: SimulationService;

    before() {
        this.simulationService = new SimulationService(new BrowserServiceFactory());
    }

    @test
    @timeout(60_000)
    async testSimulate() {
        const manifest: V1.BlueprintManifest = await load('test/fixtures/google-image-search.blueprint.yaml', '1');
        await this.simulationService.simulate(manifest, { headless: true, windowSize: { width: 1280, height: 720 }, outputDir: 'tmp', args: [ { name: "query", value: "dogs" }], profile: "test" });
    }

}