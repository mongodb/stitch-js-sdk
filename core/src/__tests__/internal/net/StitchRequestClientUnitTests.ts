import {
  mock,
  when,
  anything,
  instance,
  capture
} from "ts-mockito/lib/ts-mockito";
import { FetchTransport, StitchRequestClient } from "../../../lib";
import { StitchRequest } from "../../../lib/internal/net/StitchRequest";
import Method from "../../../lib/internal/net/Method";
import StitchServiceException from "../../../lib/StitchServiceException";
import { BasicRequest } from "../../../lib/internal/net/BasicRequest";
import { StitchServiceErrorCode } from "../../../lib/StitchServiceErrorCode";
import ContentTypes from "../../../lib/internal/net/ContentTypes";
import Headers from "../../../lib/internal/net/Headers";
import { parse } from "mongodb-extjson";
import { StitchDocRequest } from "../../../lib/internal/net/StitchDocRequest";
import StitchException from "../../../lib/StitchException";

describe("StitchRequestClientUnitTests", () => {
  it("should doRequest", () => {
    const domain = "http://domain.com";
    const transportMock = mock(FetchTransport);
    const transport = instance(transportMock);
    const stitchRequestClient = new StitchRequestClient(domain, transport);

    // A bad response should throw an exception
    when(transportMock.roundTrip(anything())).thenResolve({
      statusCode: 500,
      body: undefined,
      headers: {}
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
          statusCode: 200,
          body: '{"hello": "world", "a": 42}',
          headers: {}
        });

        return stitchRequestClient.doRequest(builder.build());
      })
      .then(response => {
        expect(response.statusCode).toBe(200);
        const expected = {
          hello: "world",
          a: 42
        };
        expect(expected).toEqual(parse(response.body!, { relaxed: true }));

        // Error responses should be handled
        when(transportMock.roundTrip(anything())).thenResolve({
          statusCode: 500,
          headers: {}
        });

        return stitchRequestClient.doRequest(builder.build());
      })
      .catch((error: StitchServiceException) => {
        expect(error.errorCode).toEqual(StitchServiceErrorCode.Unknown);
        expect(error.message).toContain("received unexpected status");
      })
      .then(() => {
        when(transportMock.roundTrip(anything())).thenResolve({
          statusCode: 500,
          headers: {},
          body: "whoops"
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
          statusCode: 500,
          headers: headers,
          body: "whoops"
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
          statusCode: 500,
          headers: headers,
          body: '{"error": "bad", "error_code": "InvalidSession"}'
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
      statusCode: 500,
      headers: {}
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
          statusCode: 200,
          headers: {},
          body: '{"hello": "world", "a": 42}'
        });

        return stitchRequestClient.doRequest(builder.build());
      })
      .then(response => {
        expect(response.statusCode).toEqual(200);
        const expected = {
          hello: "world",
          a: 42
        };
        expect(parse(response.body!, { relaxed: true })).toEqual(expected);

        // Error responses should be handled
        when(transportMock.roundTrip(anything())).thenResolve({
          statusCode: 500,
          headers: {}
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
          statusCode: 500,
          headers: {},
          body: "whoops"
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
          statusCode: 500,
          headers: headers,
          body: "whoops"
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
          statusCode: 500,
          headers: headers,
          body: '{"error": "bad", "error_code": "InvalidSession"}'
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
      statusCode: 500,
      headers: {}
    });

    const path = "/path";
    const builder = new StitchRequest.Builder()
      .withPath(path)
      .withMethod(Method.GET);

    const headers = {
      [Headers.CONTENT_TYPE]: ContentTypes.APPLICATION_JSON
    };

    when(transportMock.roundTrip(anything())).thenResolve({
      statusCode: 502,
      headers: headers,
      body: '{"error": "bad", "error_code": "InvalidSession"}'
    });

    expect(stitchRequestClient.doRequest(builder.build())).rejects.toEqual(
      new StitchServiceException("bad", StitchServiceErrorCode.InvalidSession)
    );

    headers[Headers.CONTENT_TYPE_CANON] = ContentTypes.APPLICATION_JSON;

    // A bad response should throw an exception
    when(transportMock.roundTrip(anything())).thenResolve({
      statusCode: 500,
      headers: headers,
      body: '{"error": "bad", "error_code": "InvalidSession"}'
    });

    expect(stitchRequestClient.doRequest(builder.build())).rejects.toEqual(
      new StitchServiceException("bad", StitchServiceErrorCode.InvalidSession)
    );
  });
});
