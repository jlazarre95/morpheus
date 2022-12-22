import { plainToInstance } from "class-transformer";
import { readFile } from "fs-extra";

export class HarHeader {
    name: string;
    value: string;
}

export class HarCookie {
    name: string;
    value: string;
    path: string;
    domain: string;
    expires: string;
    httpOnly: boolean;
    secure: false;
}

export class HarQueryString {
    name: string;
    value: string;
}

export class HarPostDataParam {
    name: string;
    value: string;
    fileName: string;
    contentType: string;
}

export class HarPostData {
    mimeType: string;
    text: string;
    params: HarPostDataParam[];
}

export class HarRequest {
    url: string;
    method: string;
    headers: HarHeader[];
    cookies: HarCookie[];
    queryString: HarQueryString;
    postData: HarPostData;

    getBody(): string {
        if (this.postData.text) {
            return this.postData.text;
        } else if(this.postData.params) {
            let str: string = '';
            for (const param of this.postData.params) {
                str += `&${param.name}=${param.value}`;
            }
            return str.length >= 1 ? str.substring(1) : '';
        }
        return '';
    }   
}

export class HarResponseContent {
    size: number;
    mimeType: string;
    text: string;
}

export class HarResponse {
    status: number;
    statusText: string;
    headers: HarHeader[];
    cookies: HarCookie[];
    content: HarResponseContent;
    redirectUrl: string;

    getBody(): string {
        return this.content?.text || '';
    }
}

export class HarEntry {
    startedDateTime: string;
    request: HarRequest;
    response: HarResponse;
}

export class HarLog {
    entries: HarEntry[];
}

export class Har {
    log: HarLog;

    static async loadHarFile(path: string): Promise<Har> {
        return this.parseBuffer(await readFile(path));
    }

    private static parseBuffer(buffer: Buffer): Har {
        return this.parseString(buffer.toString("utf-8"));
    }

    private static parseString(str: string): Har {
        return plainToInstance(Har, JSON.parse(str));
    }

    static getHeader(name: string, headers: HarHeader[]): HarHeader | undefined {
        for (const h of headers)
            if (h.name.toLowerCase() === name.toLowerCase())
                return h;
        return undefined;
    }

    static getHeaderValue(name: string, headers: HarHeader[]): string | undefined {
        return this.getHeader(name, headers)?.value;
    }

    static headersToString(headers: HarHeader[]): string {
        let str: string = "";
        for (const header of headers) {
            str += `\n${header.name}: ${header.value}`;
        }
        return str;
    }
}