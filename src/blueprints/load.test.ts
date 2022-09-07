import { suite, test } from "@testdeck/mocha";
import { loadBlueprint } from "./load";
import { BlueprintManifest } from "./models";

@suite
export class loadTests {

    @test
    async canLoadSimpleBlueprint() {
        const manifest: BlueprintManifest = await loadBlueprint('test/fixtures/simple.blueprint.yaml');
        // console.log(JSON.stringify(manifest, null, 4));
    }

    @test
    async canLoadComplexBlueprint() {
        let manifest: BlueprintManifest = await loadBlueprint('test/fixtures/complex.blueprint.yaml', {
            profile: 'broadL',
            args: {
                url: { value: "https://www.google.com" },
                // username: { value: "johndoe01" },
                // password: { value: "password$1" },
            }
        });
        // console.log(manifest.blueprint.args!);
        // console.log(JSON.stringify(manifest, null, 4));
    }

}