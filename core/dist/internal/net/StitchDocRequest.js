"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const StitchRequest_1 = require("./StitchRequest");
class StitchDocRequest extends StitchRequest_1.default {
    constructor(request, document) {
        super(request.method, request.path, request.headers, request.body, request.startedAt);
        this.document = document;
    }
    get builder() {
        return new StitchDocRequest.Builder(this);
    }
}
StitchDocRequest.Builder = class extends StitchRequest_1.default.Builder {
    constructor(request) {
        super(request);
        if (request !== undefined) {
            this.document = request.document;
        }
    }
    withDocument(document) {
        this.document = document;
        return this;
    }
    build() {
        return new StitchDocRequest(super.build(), this.document);
    }
};
exports.default = StitchDocRequest;
//# sourceMappingURL=StitchDocRequest.js.map