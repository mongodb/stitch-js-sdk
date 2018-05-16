import Response from "../../internal/net/Response";
import StitchAuthDocRequest from "../../internal/net/StitchAuthDocRequest";
import StitchAuthRequest from "../../internal/net/StitchAuthRequest";
interface StitchAuthRequestClient {
    doAuthenticatedRequest(stitchReq: StitchAuthRequest): Promise<Response>;
    doAuthenticatedJSONRequest(stitchReq: StitchAuthDocRequest): Promise<any>;
    doAuthenticatedJSONRequestRaw(stitchReq: StitchAuthDocRequest): Promise<Response>;
}
export default StitchAuthRequestClient;
