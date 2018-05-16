"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class BasicRequest {
    constructor(method, url, headers, body) {
        this.method = method;
        this.url = url;
        this.headers = headers;
        this.body = body;
    }
}
BasicRequest.Builder = class {
    constructor(request) {
        if (!request) {
            return;
        }
        this.method = request.method;
        this.url = request.url;
        this.headers = request.headers;
        this.body = request.body;
    }
    withMethod(method) {
        this.method = method;
        return this;
    }
    withURL(url) {
        this.url = url;
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
            throw new Error("must set method");
        }
        if (this.url === undefined) {
            throw new Error("must set non-empty url");
        }
        return new BasicRequest(this.method, this.url, this.headers === undefined
            ? {}
            : this.headers, this.body);
    }
};
exports.default = BasicRequest;
//# sourceMappingURL=BasicRequest.js.map