import { Stringifyable } from "../../../../types/stringifyable";

export interface LrUsrFileOptions {
    actionFileName: string;
    configFileName: string;
    globalsFileName: string;
    prmFileName: string;
    scriptVersion: string;
    uspFileName: string;
    vUserInitFileName: string;
    vUserEndFileName: string;
    transactionNames: string[];
}

export class LrUsrFile implements Stringifyable {
    
    private majorScriptVersion: string;
    private minorScriptVersion: string;

    constructor(private options: LrUsrFileOptions) {
        const tokens = options.scriptVersion.split('.');
        this.majorScriptVersion = tokens[0];
        this.minorScriptVersion = tokens[1];
    }

    toString(): string {
return `[General]
Type=Multi
DefaultCfg=${this.options.configFileName}
ParameterFile=${this.options.prmFileName}
GlobalParameterFile=
NewFunctionHeader=1
RunType=cci
ActionLogicExt=action_logic
LastActiveAction=Action
MajorVersion=${this.majorScriptVersion}
MinorVersion=${this.minorScriptVersion}
ActiveTypes=QTWeb
GenerateTypes=QTWeblr
AdditionalTypes=QTWeb
DevelopTool=Vugen
LastModifyVer=${this.options.scriptVersion}
ParamLeftBrace={
ParamRightBrace=}
ScriptLanguage=C
LastCodeGenerationVer=${this.options.scriptVersion}
DisableRegenerate=0
Description=
ScriptLocale=en-US
[Actions]
vuser_init=${this.options.vUserInitFileName}
Action=${this.options.actionFileName}
vuser_end=${this.options.vUserEndFileName}
[RunLogicFiles]
Default Profile=${this.options.uspFileName}
[VuserProfiles]
Profiles=Default Profile
[CfgFiles]
Default Profile=${this.options.configFileName}
[ExtraFiles]
${this.options.globalsFileName}=
[Modified Actions]
vuser_init=0
Action=1
vuser_end=0
[Recorded Actions]
vuser_init=0
Action=1
vuser_end=0
[Replayed Actions]
vuser_init=0
Action=0
vuser_end=0
[Interpreters]
vuser_init=cci
Action=cci
vuser_end=cci
[TransactionsOrder]
Order="${this.options.transactionNames.join('__*delimiter*__')}"
[StateManagement]
LastReplayStatus=0
[ActiveReplay]
LastReplayedRunName=
ActiveRunName=
[Transactions]
${this.options.transactionNames.map(t => t + '=').join('\n')}`;
    }    

}