import { suite, test } from "@testdeck/mocha";
import { join } from "path";
import { loadBlueprint } from "../../load";
import { BlueprintManifest } from "../../models";
import { ScriptType } from "../script-type";
import { ScriptService } from "../script.service";

import { LoadRunnerScriptGenerator } from "./load-runner.script-generator";
import { assert } from "chai";
import { pathExistsSync } from "fs-extra";
import { readFileSync } from "fs";
import { numOccurrences } from "../../../util/string.util";
import moment from "moment";

// interface ScriptMetadata {
//     creatorName?: string;
//     creatorEmail?: string;
//     description?: string;
// }

@suite
export class LoadRunnerScriptGeneratorTests {

    private scriptService: ScriptService;
    private loadRunnerScriptGenerator: LoadRunnerScriptGenerator;
    private outputDir: string = join('tmp', 'view-pay');

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
            profile: 'serviceb',
            date: moment().month(2).date(12).year(2023).toDate() // March 12, 2023
        });

        const expectedPaths = [
            join('tmp', 'view-pay', 'Action.c'),
            join('tmp', 'view-pay', 'default.cfg'),
            join('tmp', 'view-pay', 'default.usp'),
            join('tmp', 'view-pay', 'globals.h'),
            join('tmp', 'view-pay', 'lrw_custom_body.h'),
            join('tmp', 'view-pay', 'Users.dat'),
            join('tmp', 'view-pay', 'ViewPay.prm'),
            join('tmp', 'view-pay', 'ViewPay.usr'),
            join('tmp', 'view-pay', 'vuser_end.c'),
            join('tmp', 'view-pay', 'vuser_init.c')
        ];
        for(const path of expectedPaths) {
            assert.isTrue(pathExistsSync(path), `Expected path to exist: '${path}'`);
        }

        const actionFile = readFileSync(join('tmp', 'view-pay', 'Action.c')).toString();

        // Check transactions
        this.assertPattern(actionFile, `lr_start_transaction("VP_01_HitServer");`, 1);
        this.assertPattern(actionFile, `lr_start_transaction("VP_02_Login");`, 1);
        this.assertPattern(actionFile, `lr_start_transaction("VP_03_ViewPayCheck");`, 1);
        this.assertPattern(actionFile, `lr_start_transaction("VP_04_Logout");`, 1);
        this.assertPattern(actionFile, `lr_end_transaction("VP_01_HitServer", LR_AUTO)`, 1);
        this.assertPattern(actionFile, `lr_end_transaction("VP_02_Login", LR_AUTO)`, 1);
        this.assertPattern(actionFile, `lr_end_transaction("VP_03_ViewPayCheck", LR_AUTO)`, 1);
        this.assertPattern(actionFile, `lr_end_transaction("VP_04_Logout", LR_AUTO)`, 1);

        // Check parameters
        this.assertPattern(actionFile, "{P_Url}");
        this.assertPattern(actionFile, "{P_Username}", 1);
        this.assertPattern(actionFile, "{P_Password}", 1);
        this.assertPattern(actionFile, "{P_Date_1}", 1);
        this.assertPattern(actionFile, "{P_Date_2}", 1);
        this.assertPattern(actionFile, "{C_ViewState_1}", 1);
        this.assertPattern(actionFile, "{C_ViewStateGen_1}", 1);
        this.assertPattern(actionFile, "{C_EventValidation_1}", 1);

        // Check web_reg_save_params
        this.assertPattern(actionFile, new RegExp(`web_reg_save_param_ex\\(\\s+"ParamName=C_ViewState_1",`), 1);
        this.assertPattern(actionFile, new RegExp(`web_reg_save_param_ex\\(\\s+"ParamName=C_ViewState_2",`), 1);
        this.assertPattern(actionFile, new RegExp(`web_reg_save_param_ex\\(\\s+"ParamName=C_ViewState_3",`), 1);
        this.assertPattern(actionFile, new RegExp(`web_reg_save_param_ex\\(\\s+"ParamName=C_ViewState_4",`), 1);
        this.assertPattern(actionFile, new RegExp(`web_reg_save_param_ex\\(\\s+"ParamName=C_ViewState_5",`), 1);
        this.assertPattern(actionFile, new RegExp(`web_reg_save_param_ex\\(\\s+"ParamName=C_ViewState_6",`), 1);
        this.assertPattern(actionFile, new RegExp(`web_reg_save_param_ex\\(\\s+"ParamName=C_ViewState_7",`), 1);
        this.assertPattern(actionFile, new RegExp(`web_reg_save_param_ex\\(\\s+"ParamName=C_ViewState_8",`), 1);
        this.assertPattern(actionFile, new RegExp(`web_reg_save_param_ex\\(\\s+"ParamName=C_ViewState_9",`), 1);
        this.assertPattern(actionFile, new RegExp(`web_reg_save_param_ex\\(\\s+"ParamName=C_ViewStateGen_1",`), 1);
        this.assertPattern(actionFile, new RegExp(`web_reg_save_param_ex\\(\\s+"ParamName=C_ViewStateGen_2",`), 1);
        this.assertPattern(actionFile, new RegExp(`web_reg_save_param_ex\\(\\s+"ParamName=C_ViewStateGen_3",`), 1);
        this.assertPattern(actionFile, new RegExp(`web_reg_save_param_ex\\(\\s+"ParamName=C_ViewStateGen_4",`), 1);
        this.assertPattern(actionFile, new RegExp(`web_reg_save_param_ex\\(\\s+"ParamName=C_ViewStateGen_5",`), 1);
        this.assertPattern(actionFile, new RegExp(`web_reg_save_param_ex\\(\\s+"ParamName=C_ViewStateGen_6",`), 1);
        this.assertPattern(actionFile, new RegExp(`web_reg_save_param_ex\\(\\s+"ParamName=C_ViewStateGen_7",`), 1);
        this.assertPattern(actionFile, new RegExp(`web_reg_save_param_ex\\(\\s+"ParamName=C_ViewStateGen_8",`), 1);
        this.assertPattern(actionFile, new RegExp(`web_reg_save_param_ex\\(\\s+"ParamName=C_ViewStateGen_9",`), 1);
        this.assertPattern(actionFile, new RegExp(`web_reg_save_param_ex\\(\\s+"ParamName=C_EventValidation_1",`), 1);
        this.assertPattern(actionFile, new RegExp(`web_reg_save_param_ex\\(\\s+"ParamName=C_EventValidation_2",`), 1);
        this.assertPattern(actionFile, new RegExp(`web_reg_save_param_ex\\(\\s+"ParamName=C_EventValidation_3",`), 1);
        this.assertPattern(actionFile, new RegExp(`web_reg_save_param_ex\\(\\s+"ParamName=C_EventValidation_4",`), 1);
        this.assertPattern(actionFile, new RegExp(`web_reg_save_param_ex\\(\\s+"ParamName=C_EventValidation_5",`), 1);
        this.assertPattern(actionFile, new RegExp(`web_reg_save_param_ex\\(\\s+"ParamName=C_EventValidation_6",`), 1);
        this.assertPattern(actionFile, new RegExp(`web_reg_save_param_ex\\(\\s+"ParamName=C_EventValidation_7",`), 1);

        // Check web_convert_params
        this.assertPattern(actionFile, `web_convert_param("C_ViewState_1", "SourceEncoding=HTML", "TargetEncoding=URL", LAST);`, 1);
        this.assertPattern(actionFile, `web_convert_param("C_ViewStateGen_1", "SourceEncoding=HTML", "TargetEncoding=URL", LAST);`, 1);
        this.assertPattern(actionFile, `web_convert_param("C_EventValidation_1", "SourceEncoding=HTML", "TargetEncoding=URL`, 1);

        // Check comments and other LR calls
        this.assertPattern(actionFile, `// APPLY RULE: {"type":"correlation",`, 25);
        this.assertPattern(actionFile, new RegExp(`lr_think_time\\(\\d+\\);`));
        this.assertPattern(actionFile, `web_add_header("`);
        this.assertPattern(actionFile, `web_custom_request("`);
        this.assertPattern(actionFile, `web_concurrent_start(NULL);`);
        this.assertPattern(actionFile, `web_concurrent_end(NULL);`);

        // Check excluded headers
        this.assertPattern(actionFile, 'Sec-Fetch-', 0);

        // Check excluded URLs
        this.assertPattern(actionFile, 'gvt.com', 0);
        this.assertPattern(actionFile, 'google.com', 0);
        this.assertPattern(actionFile, 'gstatic.com', 0);
        this.assertPattern(actionFile, 'mozilla.com', 0);
        this.assertPattern(actionFile, 'ocsp.digicert.com', 0);
        this.assertPattern(actionFile, 'googleapis.com', 0);
        this.assertPattern(actionFile, 'googleapi.com', 0);
        this.assertPattern(actionFile, 'app.pendo.io', 0);
    }

    private assertPattern(text: string, pattern: string | RegExp, expectedOcurrences?: number) {
        if(expectedOcurrences !== undefined) {
            const actualOccurrences = numOccurrences(text, pattern);
            assert.strictEqual(actualOccurrences, expectedOcurrences, `Found pattern ${actualOccurrences} time(s), but it was expected ${expectedOcurrences} time(s): ${pattern}`);    
        } else {
            const actualOccurrences = numOccurrences(text, pattern);
            assert.isAtLeast(actualOccurrences, 1, `Found pattern ${actualOccurrences} time(s), but it was expected at least 1 time(s): ${pattern}`);
        }
    }

}