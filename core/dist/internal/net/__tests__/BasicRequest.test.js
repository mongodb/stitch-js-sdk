"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const BasicRequest_1 = require("../BasicRequest");
const Method_1 = require("../Method");
describe("BasicRequest", () => {
    it("should throw if missing Method", () => {
        const builder = new BasicRequest_1.default.Builder();
        builder.withURL("http://localhost:8080");
        expect(() => builder.build()).toThrowError();
    });
    it("should throw if missing URL", () => {
        const builder = new BasicRequest_1.default.Builder();
        builder.withMethod(Method_1.default.GET);
        expect(() => builder.build()).toThrowError();
    });
    it("should initialize", () => {
        const method = Method_1.default.GET;
        const url = "http://localhost:8080";
        const headers = { foo: "bar" };
        const body = [1, 2, 3];
        const builder = new BasicRequest_1.default.Builder();
        builder
            .withMethod(method)
            .withURL(url)
            .withHeaders(headers)
            .withBody(body);
        const request = builder.build();
        expect(request.body).toEqual(body);
        expect(request.headers).toEqual(headers);
        expect(request.url).toEqual(url);
        expect(request.method).toEqual(method);
    });
});
//# sourceMappingURL=BasicRequest.test.js.map