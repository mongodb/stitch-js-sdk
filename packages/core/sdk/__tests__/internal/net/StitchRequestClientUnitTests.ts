/**
 * Copyright 2018-present MongoDB, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { parse } from "mongodb-extjson";
import { anything, capture, instance, mock, when } from "ts-mockito";
import { FetchTransport, StitchRequestClient } from "../../../src";
import { BasicRequest } from "../../../src/internal/net/BasicRequest";
import ContentTypes from "../../../src/internal/net/ContentTypes";
import Headers from "../../../src/internal/net/Headers";
import Method from "../../../src/internal/net/Method";
import { StitchDocRequest } from "../../../src/internal/net/StitchDocRequest";
import { StitchRequest } from "../../../src/internal/net/StitchRequest";
import StitchError from "../../../src/StitchError";
import { StitchServiceErrorCode } from "../../../src/StitchServiceErrorCode";
import StitchServiceError from "../../../src/StitchServiceError";

describe("StitchRequestClientUnitTests", () => {
  it("should doRequest", () => {
    const domain = "http://domain.com";
    const transportMock = mock(FetchTransport);
    const transport = instance(transportMock);
    const stitchRequestClient = new StitchRequestClient(domain, transport);

    // A bad response should throw an exception
    when(transportMock.roundTrip(anything())).thenResolve({
      body: undefined,
      headers: {},
      statusCode: 500
    });

    const path = "/path";
    const builder = new StitchRequest.Builder()
      .withPath(path)
      .withMethod(Method.GET);

    return stitchRequestClient
      .doRequest(builder.build())
      .catch(error => {
        expect(error instanceof StitchServiceError).toBeTruthy();
      })
      .then(() => {
        const [actualRequest] = capture(transportMock.roundTrip).first();
        const expectedRequest = new BasicRequest.Builder()
          .withMethod(Method.GET)
          .withUrl(domain + path)
          .build();
        expect(expectedRequest).toEqual(actualRequest);

        // A normal response should be able to be decoded
        when(transportMock.roundTrip(anything())).thenResolve({
          body: '{"hello": "world", "a": 42}',
          headers: {},
          statusCode: 200
        });

        return stitchRequestClient.doRequest(builder.build());
      })
      .then(response => {
        expect(response.statusCode).toBe(200);
        const expected = {
          a: 42,
          hello: "world"
        };
        expect(expected).toEqual(parse(response.body!, { relaxed: true }));

        // Error responses should be handled
        when(transportMock.roundTrip(anything())).thenResolve({
          headers: {},
          statusCode: 500
        });

        return stitchRequestClient.doRequest(builder.build());
      })
      .catch((error: StitchServiceError) => {
        expect(error.errorCode).toEqual(StitchServiceErrorCode.Unknown);
        expect(error.message).toContain("received unexpected status");
      })
      .then(() => {
        when(transportMock.roundTrip(anything())).thenResolve({
          body: "whoops",
          headers: {},
          statusCode: 500
        });

        return stitchRequestClient.doRequest(builder.build());
      })
      .catch((error: StitchServiceError) => {
        expect(error.errorCode).toEqual(StitchServiceErrorCode.Unknown);
        expect(error.message).toEqual("whoops");
      })
      .then(() => {
        const headers = {
          [Headers.CONTENT_TYPE]: ContentTypes.APPLICATION_JSON
        };

        when(transportMock.roundTrip(anything())).thenResolve({
          body: "whoops",
          headers,
          statusCode: 500
        });

        return stitchRequestClient.doRequest(builder.build());
      })
      .catch((error: StitchServiceError) => {
        expect(error.errorCode).toEqual(StitchServiceErrorCode.Unknown);
        expect(error.message).toEqual("whoops");
      })
      .then(() => {
        const headers = {
          [Headers.CONTENT_TYPE]: ContentTypes.APPLICATION_JSON
        };

        when(transportMock.roundTrip(anything())).thenResolve({
          body: '{"error": "bad", "error_code": "InvalidSession"}',
          headers,
          statusCode: 500
        });

        return stitchRequestClient.doRequest(builder.build());
      })
      .catch((error: StitchServiceError) => {
        expect(error.errorCode).toEqual(StitchServiceErrorCode.InvalidSession);
        expect(error.message).toEqual("bad");
      })
      .then(() => {
        when(transport.roundTrip(anything())).thenReject(new StitchError());

        return stitchRequestClient.doRequest(builder.build());
      })
      .catch((error: Error) => {
        expect(error).toBeDefined();
      });
  });

  it("should test doJSONRequestWithDoc", () => {
    const domain = "http://domain.com";
    const transportMock = mock(FetchTransport);
    const transport = instance(transportMock);
    const stitchRequestClient = new StitchRequestClient(domain, transport);

    const path = "/path";
    const document = { my: 24 };
    const builder = new StitchDocRequest.Builder();
    builder.withDocument(document);
    builder.withPath(path).withMethod(Method.PATCH);

    // A bad response should throw an exception
    when(transportMock.roundTrip(anything())).thenResolve({
      headers: {},
      statusCode: 500
    });

    return stitchRequestClient
      .doRequest(builder.build())
      .catch((error: StitchServiceError) => {
        expect(error instanceof StitchServiceError).toBeTruthy();
        const [actualRequest] = capture(transportMock.roundTrip).first();
        const expectedHeaders = {
          [Headers.CONTENT_TYPE_CANON]: ContentTypes.APPLICATION_JSON
        };
        const expectedRequest = new BasicRequest.Builder()
          .withMethod(Method.PATCH)
          .withUrl(domain + path)
          .withBody('{"my":{"$numberInt":"24"}}')
          .withHeaders(expectedHeaders)
          .build();

        expect(actualRequest).toEqual(expectedRequest);

        // A normal response should be able to be decoded
        when(transportMock.roundTrip(anything())).thenResolve({
          body: '{"hello": "world", "a": 42}',
          headers: {},
          statusCode: 200
        });

        return stitchRequestClient.doRequest(builder.build());
      })
      .then(response => {
        expect(response.statusCode).toEqual(200);
        const expected = {
          a: 42,
          hello: "world"
        };
        expect(parse(response.body!, { relaxed: true })).toEqual(expected);

        // Error responses should be handled
        when(transportMock.roundTrip(anything())).thenResolve({
          headers: {},
          statusCode: 500
        });
        return stitchRequestClient.doRequest(builder.build());
      })
      .catch((error: StitchServiceError) => {
        expect(error.errorCode).toEqual(StitchServiceErrorCode.Unknown);
        expect(error.message).toContain("received unexpected status");
      })
      .then(() => {
        // Error responses should be handled
        when(transportMock.roundTrip(anything())).thenResolve({
          body: "whoops",
          headers: {},
          statusCode: 500
        });
        return stitchRequestClient.doRequest(builder.build());
      })
      .catch((error: StitchServiceError) => {
        expect(error.errorCode).toEqual(StitchServiceErrorCode.Unknown);
        expect(error.message).toEqual("whoops");
      })
      .then(() => {
        const headers = {
          [Headers.CONTENT_TYPE]: ContentTypes.APPLICATION_JSON
        };

        when(transportMock.roundTrip(anything())).thenResolve({
          body: "whoops",
          headers,
          statusCode: 500
        });
        stitchRequestClient.doRequest(builder.build());
      })
      .catch((error: StitchServiceError) => {
        expect(error.errorCode).toEqual(StitchServiceErrorCode.Unknown);
        expect(error.message).toEqual("whoops");
      })
      .then(() => {
        const headers = {
          [Headers.CONTENT_TYPE]: ContentTypes.APPLICATION_JSON
        };

        when(transportMock.roundTrip(anything())).thenResolve({
          body: '{"error": "bad", "error_code": "InvalidSession"}',
          headers,
          statusCode: 500
        });
      })
      .catch((error: StitchServiceError) => {
        expect(error.errorCode).toEqual(StitchServiceErrorCode.InvalidSession);
        expect(error.message).toEqual("bad");
      })
      .then(() => {
        when(transport.roundTrip(anything())).thenReject(new StitchError());

        return stitchRequestClient.doRequest(builder.build());
      })
      .catch((error: Error) => {
        expect(error).toBeDefined();
      });
  });

  it("should handle non canonical headers", () => {
    const domain = "http://domain.com";
    const transportMock = mock(FetchTransport);
    const transport = instance(transportMock);

    const stitchRequestClient = new StitchRequestClient(domain, transport);

    // A bad response should throw an exception
    when(transportMock.roundTrip(anything())).thenResolve({
      headers: {},
      statusCode: 500
    });

    const path = "/path";
    const builder = new StitchRequest.Builder()
      .withPath(path)
      .withMethod(Method.GET);

    const headers = {
      [Headers.CONTENT_TYPE]: ContentTypes.APPLICATION_JSON
    };

    when(transportMock.roundTrip(anything())).thenResolve({
      body: '{"error": "bad", "error_code": "InvalidSession"}',
      headers,
      statusCode: 502
    });

    expect(stitchRequestClient.doRequest(builder.build())).rejects.toEqual(
      new StitchServiceError("bad", StitchServiceErrorCode.InvalidSession)
    );

    headers[Headers.CONTENT_TYPE_CANON] = ContentTypes.APPLICATION_JSON;

    // A bad response should throw an exception
    when(transportMock.roundTrip(anything())).thenResolve({
      body: '{"error": "bad", "error_code": "InvalidSession"}',
      headers,
      statusCode: 500
    });

    expect(stitchRequestClient.doRequest(builder.build())).rejects.toEqual(
      new StitchServiceError("bad", StitchServiceErrorCode.InvalidSession)
    );
  });
});
