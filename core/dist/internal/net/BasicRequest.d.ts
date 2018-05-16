import Method from "./Method";
export default class BasicRequest {
    static Builder: {
        new (request?: BasicRequest | undefined): {
            method?: Method | undefined;
            url?: string | undefined;
            headers?: {
                [key: string]: string;
            } | undefined;
            body?: any;
            withMethod(method: Method): any;
            withURL(url: string): any;
            withHeaders(headers: {
                [key: string]: string;
            }): any;
            withBody(body: any): any;
            build(): BasicRequest;
        };
    };
    readonly method: Method;
    readonly url: string;
    readonly headers: {
        [key: string]: string;
    };
    readonly body?: any;
    private constructor();
}
