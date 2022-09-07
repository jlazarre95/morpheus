import moment from "moment-timezone";
import { Stringifyable } from "../../../../types/stringifyable";

export interface LrConfigFileOptions {
    date?: Date;
    uspFileName: string;
}

export class LrConfigFile implements Stringifyable {
    
    private uspFileName: string;
    private dateStr: string;

    constructor(options: LrConfigFileOptions) {
        this.uspFileName = options.uspFileName;
        const date: Date = options.date || new Date();
        this.dateStr = moment(date).tz("gmt").format('YYYY/MM/DD HH:mm:ss')
    }

    toString(): string {
return `[General]
XlBridgeTimeout=120
DefaultRunLogic=${this.uspFileName}
automatic_nested_transactions=1
AutomaticTransactions=1
[ThinkTime]
Options=NOTHINK
Factor=1
LimitFlag=0
Limit=1
[Iterations]
NumOfIterations=1
IterationPace=IterationASAP
StartEvery=60
RandomMin=60
RandomMax=90
[Log]
LogOptions=LogBrief
MsgClassData=0
MsgClassParameters=0
MsgClassFull=0
[WEB]
SearchForImages=1
WebRecorderVersion=10
MaxConnections=0
LogFileWriteTraceToFile=0
LogFileWrite=0
StartRecordingGMT=${this.dateStr}
StartRecordingIsDst=0
NavigatorBrowserLanguage=en-US
NavigatorSystemLanguage=en-US
NavigatorUserLanguage=en-US
ScreenWidth=1888
ScreenHeight=919
ScreenAvailWidth=1888
ScreenAvailHeight=891
UserHomePage=about:blank
BrowserType=Microsoft Internet Explorer 4.0
HttpVer=1.1
CustomUserAgent=Mozilla/5.0 (Windows NT 6.1; Win64; x64; Trident/7.0; rv:11.0) like Gecko
ResetContext=True
UseBrowserAgent=0
UseCustomAgent=1
KeepAlive=Yes
EnableChecks=0
AnalogMode=0
ProxyUseBrowser=0
ProxyUseProxy=0
ProxyHTTPHost=
ProxyHTTPSHost=
ProxyHTTPPort=443
ProxyHTTPSPort=443
ProxyUseSame=1
ProxyNoLocal=0
ProxyBypass=
ProxyUserName=
ProxyPassword=
ProxyUseAutoConfigScript=0
ProxyAutoConfigScriptURL=
ProxyUseProxyServer=0
SaveSnapshotResources=1
UTF8InputOutput=0
SupportCharset=None
BrowserAcceptLanguage=en-US
BrowserAcceptEncoding=gzip, deflate
RecorderWinCodePage=1252
UseDataFormatExtensions=FALSE`;
    }

}