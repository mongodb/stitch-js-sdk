"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const StitchAuthRequest_1 = require("./StitchAuthRequest");
const StitchRequest_1 = require("./StitchRequest");
class StitchAuthDocRequest extends StitchAuthRequest_1.default {
    constructor(request, document) {
        super(request, false);
        this.document = document;
    }
    get builder() {
        return new StitchAuthRequest_1.default.Builder(this);
    }
}
StitchAuthDocRequest.Builder = class extends StitchRequest_1.default.Builder {
    constructor(request) {
        super(request);
    }
    withDocument(document) {
        this.document = document;
        return this;
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
        return new StitchAuthDocRequest(super.build(), document);
    }
};
exports.default = StitchAuthDocRequest;
//# sourceMappingURL=StitchAuthDocRequest.js.map