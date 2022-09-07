import { suite, test } from "@testdeck/mocha";
import { join } from "path";
import { stringify } from "../../../util/serialization.util";
import { loadBlueprint } from "../../load";
import { BlueprintManifest } from "../../models";
import { ScriptType } from "../script-type";
import { ScriptService } from "../script.service";

import { LoadRunnerScriptGenerator } from "./load-runner.script-generator";

interface ScriptMetadata {
    creatorName?: string;
    creatorEmail?: string;
    description?: string;
}

@suite.only
export class LoadRunnerScriptGeneratorTests {

    private scriptService: ScriptService;
    private loadRunnerScriptGenerator: LoadRunnerScriptGenerator;
    private outputDir: string = join('tmp/view-pay');

    async before() {
        this.scriptService = new ScriptService();
        this.loadRunnerScriptGenerator = new LoadRunnerScriptGenerator();
        this.scriptService.addGenerator(this.loadRunnerScriptGenerator);
    }

    async after() {
        // await remove(this.scriptPath);
    }

    @test
    async testGenerateScript() {
        let manifest: BlueprintManifest = await loadBlueprint('./test/fixtures/view-pay/view-pay.blueprint.yaml', { profile: 'serviceb' });
        await this.scriptService.script('./test/fixtures/view-pay/view-pay.har', ScriptType.loadrunner, {
            actionsPath: './test/fixtures/view-pay/view-pay-actions.json',
            outputDir: this.outputDir,
            manifest: manifest,
            profile: 'serviceb'
        });
        // console.log(stringify(manifest))
    }

}