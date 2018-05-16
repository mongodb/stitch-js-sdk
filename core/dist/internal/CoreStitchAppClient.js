"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Method_1 = require("./net/Method");
const StitchAuthDocRequest_1 = require("./net/StitchAuthDocRequest");
class CoreStitchAppClient {
    constructor(authRequestClient, routes) {
        this.authRequestClient = authRequestClient;
        this.routes = routes;
    }
    callFunctionInternal(name, ...args) {
        return this.authRequestClient.doAuthenticatedJSONRequest(this.getCallFunctionRequest(name, args));
    }
    getCallFunctionRequest(name, ...args) {
        const body = {
            args: args,
            name: name
        };
        const reqBuilder = new StitchAuthDocRequest_1.default.Builder();
        reqBuilder.withMethod(Method_1.default.POST).withPath(this.routes.functionCallRoute);
        reqBuilder.withDocument(body);
        return reqBuilder.build();
    }
}
exports.default = CoreStitchAppClient;
//# sourceMappingURL=CoreStitchAppClient.js.map