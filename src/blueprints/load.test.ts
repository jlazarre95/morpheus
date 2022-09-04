import { suite, test } from "@testdeck/mocha";
import { createBlueprint, loadBlueprintFile } from "./load";
import * as V1 from "./v1";

@suite
export class loadTests {

    @test
    async canLoadSimpleBlueprint() {
        const manifestObj: any = await loadBlueprintFile('test/fixtures/simple.blueprint.yaml');
        const manifest: V1.BlueprintManifest = await createBlueprint(manifestObj, '1');
        // console.log(JSON.stringify(manifest, null, 4));
    }

    @test
    async canLoadComplexBlueprint() {
        const manifestObj: any = await loadBlueprintFile('test/fixtures/complex.blueprint.yaml');
        const manifest: V1.BlueprintManifest = await createBlueprint(manifestObj, '1',
            {
                args: {
                    url: { value: "https://www.google.com" },
                    // username: { value: "johndoe01" },
                    // password: { value: "password$1" },
                }
            }
        );
        // console.log(manifest.blueprint.args!);
        // console.log(JSON.stringify(manifest, null, 4));
    }

}