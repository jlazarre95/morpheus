import { suite, test } from "@testdeck/mocha";
import { load } from "./load";
import * as V1 from "./v1";

@suite
export class loadTests {

    @test
    async canLoadSimpleBlueprint() {
        const manifest: V1.BlueprintManifest = await load('test/fixtures/simple.blueprint.yaml', '1');
        // console.log(JSON.stringify(manifest, null, 4));
    }

    @test
    async canLoadComplexBlueprint() {
        const manifest: V1.BlueprintManifest = await load('test/fixtures/complex.blueprint.yaml', '1');
        // console.log(JSON.stringify(manifest, null, 4));
    }   

}