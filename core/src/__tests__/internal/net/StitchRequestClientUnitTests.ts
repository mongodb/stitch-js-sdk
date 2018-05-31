import { parse } from "mongodb-extjson";
import {
  anything,
  capture,
  instance,
  mock,
  when
} from "ts-mockito/lib/ts-mockito";
import { FetchTransport, StitchRequestClient } from "../../../lib";
import { BasicRequest } from "../../../lib/internal/net/BasicRequest";
import ContentTypes from "../../../lib/internal/net/ContentTypes";
import Headers from "../../../lib/internal/net/Headers";
import Method from "../../../lib/internal/net/Method";
import { StitchDocRequest } from "../../../lib/internal/net/StitchDocRequest";
import { StitchRequest } from "../../../lib/internal/net/StitchRequest";
import StitchException from "../../../lib/StitchException";
import { StitchServiceErrorCode } from "../../../lib/StitchServiceErrorCode";
import StitchServiceException from "../../../lib/StitchServiceException";

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
        expect(error instanceof StitchServiceException).toBeTruthy();
      })
      .then(() => {
        const [actualRequest] = capture(transportMock.roundTrip).first();
        const expectedRequest = new BasicRequest.Builder()
          .withMethod(Method.GET)
          .withURL(domain + path)
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
      .catch((error: StitchServiceException) => {
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
      .catch((error: StitchServiceException) => {
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
      .catch((error: StitchServiceException) => {
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
      .catch((error: StitchServiceException) => {
        expect(error.errorCode).toEqual(StitchServiceErrorCode.InvalidSession);
        expect(error.message).toEqual("bad");
      })
      .then(() => {
        when(transport.roundTrip(anything())).thenReject(new StitchException());

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
      .catch((error: StitchServiceException) => {
        expect(error instanceof StitchServiceException).toBeTruthy();
        const [actualRequest] = capture(transportMock.roundTrip).first();
        const expectedHeaders = {
          [Headers.CONTENT_TYPE]: ContentTypes.APPLICATION_JSON
        };
        const expectedRequest = new BasicRequest.Builder()
          .withMethod(Method.PATCH)
          .withURL(domain + path)
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
      .catch((error: StitchServiceException) => {
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
      .catch((error: StitchServiceException) => {
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
      .catch((error: StitchServiceException) => {
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
      .catch((error: StitchServiceException) => {
        expect(error.errorCode).toEqual(StitchServiceErrorCode.InvalidSession);
        expect(error.message).toEqual("bad");
      })
      .then(() => {
        when(transport.roundTrip(anything())).thenReject(new StitchException());

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
      new StitchServiceException("bad", StitchServiceErrorCode.InvalidSession)
    );

    headers[Headers.CONTENT_TYPE_CANON] = ContentTypes.APPLICATION_JSON;

    // A bad response should throw an exception
    when(transportMock.roundTrip(anything())).thenResolve({
      body: '{"error": "bad", "error_code": "InvalidSession"}',
      headers,
      statusCode: 500
    });

    expect(stitchRequestClient.doRequest(builder.build())).rejects.toEqual(
      new StitchServiceException("bad", StitchServiceErrorCode.InvalidSession)
    );
  });
});
