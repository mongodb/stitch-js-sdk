"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Method_1 = require("../Method");
const StitchDocRequest_1 = require("../StitchDocRequest");
const StitchRequest_1 = require("../StitchRequest");
const StitchRequestClient_1 = require("../StitchRequestClient");
const BASE_URL = "http://localhost:9090";
const HEADER_KEY = "bar";
const HEADER_VALUE = "baz";
const HEADERS = { HEADER_KEY: HEADER_VALUE };
const TEST_DOC = { qux: "quux" };
const GET_ENDPOINT = "/get";
const NOT_GET_ENDPOINT = "/notget";
const BAD_REQUEST_ENDPOINT = "/badreq";
describe("StitchRequestClient", () => {
    it("should do request", () => {
        expect.assertions(3);
        const stitchRequestClient = new StitchRequestClient_1.default(BASE_URL, new class {
            roundTrip(request) {
                if (request.url.includes(BAD_REQUEST_ENDPOINT)) {
                    return new Promise((resolve, reject) => resolve({ statusCode: 500, headers: HEADERS, body: undefined }));
                }
                return new Promise((resolve, reject) => resolve({
                    body: request.body,
                    headers: HEADERS,
                    statusCode: 200
                }));
            }
        }());
        const builder = new StitchRequest_1.default.Builder()
            .withPath(BAD_REQUEST_ENDPOINT)
            .withMethod(Method_1.default.GET);
        return stitchRequestClient
            .doRequest(builder.build())
            .catch(err => {
            expect(err).toBeDefined();
        })
            .then(() => {
            builder.withPath(GET_ENDPOINT);
            builder.withBody(TEST_DOC);
            return stitchRequestClient.doRequest(builder.build());
        })
            .then(response => {
            expect(response.statusCode).toEqual(200);
            expect(TEST_DOC).toEqual(response.body);
        });
    });
    it("should do json request raw", () => {
        expect.assertions(3);
        const stitchRequestClient = new StitchRequestClient_1.default(BASE_URL, new class {
            roundTrip(request) {
                if (request.url.includes(BAD_REQUEST_ENDPOINT)) {
                    return new Promise((resolve, reject) => resolve({ statusCode: 500, headers: HEADERS, body: undefined }));
                }
                return new Promise((resolve, reject) => resolve({
                    body: request.body,
                    headers: HEADERS,
                    statusCode: 200
                }));
            }
        }());
        const builder = new StitchDocRequest_1.default.Builder();
        builder.withPath(BAD_REQUEST_ENDPOINT).withMethod(Method_1.default.POST);
        return stitchRequestClient
            .doJSONRequestRaw(builder.build())
            .catch(err => {
            expect(err).toBeDefined();
        })
            .then(() => {
            builder.withPath(NOT_GET_ENDPOINT);
            builder.withDocument(TEST_DOC);
            return stitchRequestClient.doJSONRequestRaw(builder.build());
        })
            .then(response => {
            expect(response.statusCode).toEqual(200);
            expect(TEST_DOC).toEqual(response.body);
        });
    });
});
//# sourceMappingURL=StitchRequestClientUnitTests.js.map