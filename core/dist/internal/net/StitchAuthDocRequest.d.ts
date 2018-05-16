import Method from "./Method";
import StitchAuthRequest from "./StitchAuthRequest";
import StitchRequest from "./StitchRequest";
export default class StitchAuthDocRequest extends StitchAuthRequest {
    static Builder: {
        new (request?: StitchAuthRequest | undefined): {
            document: object;
            useRefreshToken: boolean;
            withDocument(document: object): any;
            withAccessToken(): any;
            withRefreshToken(): any;
            build(): StitchAuthDocRequest;
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
        };
    };
    readonly document: object;
    constructor(request: StitchRequest, document: object);
    readonly builder: any;
}
