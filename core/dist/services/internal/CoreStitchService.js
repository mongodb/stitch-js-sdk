"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongodb_extjson_1 = require("mongodb-extjson");
const Method_1 = require("../../internal/net/Method");
const StitchAuthDocRequest_1 = require("../../internal/net/StitchAuthDocRequest");
class CoreStitchService {
    constructor(requestClient, routes, name) {
        this.requestClient = requestClient;
        this.serviceRoutes = routes;
        this.serviceName = name;
    }
    callFunctionInternal(name, ...args) {
        return this.requestClient.doAuthenticatedJSONRequest(this.getCallServiceFunctionRequest(name, args));
    }
    getCallServiceFunctionRequest(name, ...args) {
        const body = new mongodb_extjson_1.default();
        body.put("name", name);
        body.put("service", this.serviceName);
        body.put("arguments", args);
        return new StitchAuthDocRequest_1.default.Builder()
            .withMethod(Method_1.default.POST)
            .withPath(this.serviceRoutes.functionCallRoute)
            .withDocument(body)
            .build();
    }
}
exports.default = CoreStitchService;
//# sourceMappingURL=CoreStitchService.js.map