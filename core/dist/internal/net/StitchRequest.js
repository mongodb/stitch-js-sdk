"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class StitchRequest {
    constructor(method, path, headers, body, startedAt) {
        this.method = method;
        this.path = path;
        this.headers = headers;
        this.body = body;
        this.startedAt = startedAt;
    }
    get builder() {
        return new StitchRequest.Builder(this);
    }
}
StitchRequest.Builder = class {
    constructor(request) {
        if (request !== undefined) {
            this.method = request.method;
            this.path = request.path;
            this.headers = request.headers;
            this.body = request.body;
            this.startedAt = request.startedAt;
        }
    }
    withMethod(method) {
        this.method = method;
        return this;
    }
    withPath(path) {
        this.path = path;
        return this;
    }
    withHeaders(headers) {
        this.headers = headers;
        return this;
    }
    withBody(body) {
        this.body = body;
        return this;
    }
    build() {
        if (this.method === undefined) {
            throw Error("must set method");
        }
        if (this.path === undefined) {
            throw Error("must set non-empty path");
        }
        if (this.startedAt === undefined) {
            this.startedAt = Date.now() / 1000;
        }
        return new StitchRequest(this.method, this.path, this.headers === undefined ? {} : this.headers, this.body, this.startedAt);
    }
};
exports.default = StitchRequest;
//# sourceMappingURL=StitchRequest.js.map