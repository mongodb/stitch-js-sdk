"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const StitchError_1 = require("../../StitchError");
const BasicRequest_1 = require("./BasicRequest");
const ContentTypes_1 = require("./ContentTypes");
const Headers_1 = require("./Headers");
function inspectResponse(response) {
    if (response.statusCode >= 200 && response.statusCode < 300) {
        return response;
    }
    return StitchError_1.default.handleRequestError(response);
}
class StitchRequestClient {
    constructor(baseURL, transport) {
        this.baseURL = baseURL;
        this.transport = transport;
    }
    doRequest(stitchReq) {
        return this.transport
            .roundTrip(this.buildRequest(stitchReq))
            .then(inspectResponse);
    }
    doJSONRequestRaw(stitchReq) {
        const newReqBuilder = stitchReq.builder;
        newReqBuilder.withBody(stitchReq.document);
        const newHeaders = newReqBuilder.headers;
        newHeaders[Headers_1.default.CONTENT_TYPE] = ContentTypes_1.default.APPLICATION_JSON;
        newReqBuilder.withHeaders(newHeaders);
        return this.doRequest(newReqBuilder.build());
    }
    buildRequest(stitchReq) {
        return new BasicRequest_1.default.Builder()
            .withMethod(stitchReq.method)
            .withURL(`${this.baseURL}${stitchReq.path}`)
            .withHeaders(stitchReq.headers)
            .withBody(stitchReq.body)
            .build();
    }
}
exports.default = StitchRequestClient;
//# sourceMappingURL=StitchRequestClient.js.map