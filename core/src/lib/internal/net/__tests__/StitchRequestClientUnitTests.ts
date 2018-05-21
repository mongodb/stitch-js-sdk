import StitchRequestException from "../../../StitchRequestException";
import StitchServiceException from "../../../StitchServiceException";
import BasicRequest from "../BasicRequest";
import Method from "../Method";
import Response from "../Response";
import StitchDocRequest from "../StitchDocRequest";
import StitchRequest from "../StitchRequest";
import StitchRequestClient from "../StitchRequestClient";
import Transport from "../Transport";
import * as EJSON from "mongodb-extjson";

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

    const stitchRequestClient = new StitchRequestClient(
      BASE_URL,
      new class implements Transport {
        public roundTrip(request: BasicRequest): Promise<Response> {
          if (request.url.includes(BAD_REQUEST_ENDPOINT)) {
            return new Promise((resolve, reject) =>
              resolve({ statusCode: 500, headers: HEADERS, body: undefined })
            );
          }

          return new Promise((resolve, reject) =>
            resolve({
              body: request.body,
              headers: HEADERS,
              statusCode: 200
            })
          );
        }
      }()
    );

    const builder = new StitchRequest.Builder()
      .withPath(BAD_REQUEST_ENDPOINT)
      .withMethod(Method.GET);

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
    expect.assertions(4);

    const stitchRequestClient = new StitchRequestClient(
      BASE_URL,
      new class implements Transport {
        public roundTrip(request: BasicRequest): Promise<Response> {
          if (request.url.includes(BAD_REQUEST_ENDPOINT)) {
            return new Promise((resolve, reject) =>
              resolve({ statusCode: 500, headers: HEADERS, body: undefined })
            );
          }

          return new Promise((resolve, reject) =>
            resolve({
              body: request.body,
              headers: HEADERS,
              statusCode: 200
            })
          );
        }
      }()
    );

    const builder = new StitchDocRequest.Builder();
    builder.withPath(BAD_REQUEST_ENDPOINT).withMethod(Method.POST);
    builder.withDocument(TEST_DOC);

    return stitchRequestClient
      .doJSONRequestRaw(builder.build())
      .catch(err => {
        expect(err).toBeDefined();
        expect(err).toBeInstanceOf(StitchServiceException)
      })
      .then(() => {
        builder.withPath(NOT_GET_ENDPOINT);
        builder.withDocument(TEST_DOC);
        return stitchRequestClient.doJSONRequestRaw(builder.build())
      })
      .then(response => {
        expect(response.statusCode).toEqual(200);
        expect(TEST_DOC).toEqual(EJSON.parse(response.body));
      });
  });
});
