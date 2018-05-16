import Method from "./Method";
export default class StitchRequest {
    static Builder: {
        new (request?: StitchRequest | undefined): {
            method?: Method | undefined;
            path?: string | undefined;
            headers?: {
                [key: string]: string;
            } | undefined;
            body?: any;
            startedAt?: number | undefined;
            withMethod(method: Method): any;
            withPath(path: string): any;
            withHeaders(headers: {
                [key: string]: string;
            }): any;
            withBody(body: any): any;
            build(): StitchRequest;
        };
    };
    readonly method: Method;
    readonly path: string;
    readonly headers: {
        [key: string]: string;
    };
    readonly body: any;
    readonly startedAt: number;
    constructor(method: Method, path: string, headers: {
        [key: string]: string;
    }, body: any, startedAt: number);
    readonly builder: {
        method?: Method | undefined;
        path?: string | undefined;
        headers?: {
            [key: string]: string;
        } | undefined;
        body?: any;
        startedAt?: number | undefined;
        withMethod(method: Method): any;
        withPath(path: string): any;
        withHeaders(headers: {
            [key: string]: string;
        }): any;
        withBody(body: any): any;
        build(): StitchRequest;
    };
}
