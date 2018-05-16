"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const StitchRequest_1 = require("./StitchRequest");
class StitchAuthRequest extends StitchRequest_1.default {
    constructor(request, useRefreshToken) {
        super(request.method, request.path, request.headers, request.body, request.startedAt);
        this.useRefreshToken = useRefreshToken;
    }
    get builder() {
        return new StitchAuthRequest.Builder(this);
    }
}
StitchAuthRequest.Builder = class extends StitchRequest_1.default.Builder {
    constructor(request) {
        super(request);
    }
    withAccessToken() {
        this.useRefreshToken = false;
        return this;
    }
    withRefreshToken() {
        this.useRefreshToken = true;
        return this;
    }
    build() {
        return new StitchAuthRequest(super.build(), this.useRefreshToken);
    }
};
exports.default = StitchAuthRequest;
//# sourceMappingURL=StitchAuthRequest.js.map