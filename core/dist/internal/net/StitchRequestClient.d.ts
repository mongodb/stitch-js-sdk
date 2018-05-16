import Response from "./Response";
import StitchDocRequest from "./StitchDocRequest";
import StitchRequest from "./StitchRequest";
import Transport from "./Transport";
export default class StitchRequestClient {
    private readonly baseURL;
    private readonly transport;
    constructor(baseURL: string, transport: Transport);
    doRequest(stitchReq: StitchRequest): Promise<Response>;
    doJSONRequestRaw(stitchReq: StitchDocRequest): Promise<Response>;
    private buildRequest(stitchReq);
}
