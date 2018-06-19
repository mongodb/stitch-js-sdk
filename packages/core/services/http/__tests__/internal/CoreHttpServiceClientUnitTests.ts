import { CoreStitchServiceClientImpl } from "mongodb-stitch-core-sdk";
import { anything, capture, instance, mock, when } from "ts-mockito";
import {
  HttpMethod,
  HttpRequest,
  HttpResponse,
  CoreHttpServiceClient
} from "../../src";
import ResultDecoders from "../../src/internal/ResultDecoders";

describe("CoreHttpServiceClient", () => {
  it("should execute", async () => {
    const serviceMock = mock(CoreStitchServiceClientImpl);
    const service = instance(serviceMock);
    const client = new CoreHttpServiceClient(service);

    const expectedUrl = "http://aol.com";
    const expectedMethod = HttpMethod.DELETE;
    const expectedAuthUrl = "https://username@password:woo.com";
    const expectedBody = "hello world!";
    const expectedCookies = {};
    const expectedForm = {};
    const expectedHeaders = {};

    const request = new HttpRequest.Builder()
      .withUrl(expectedUrl)
      .withAuthUrl(expectedAuthUrl)
      .withMethod(expectedMethod)
      .withBody(expectedBody)
      .withCookies(expectedCookies)
      .withEncodeBodyAsJson(false)
      .withFollowRedirects(true)
      .withForm(expectedForm)
      .withHeaders(expectedHeaders)
      .build();

    const response = new HttpResponse(
      "OK",
      200,
      304,
      expectedHeaders,
      {},
      "body"
    );

    when(
      serviceMock.callFunctionInternal(anything(), anything(), anything())
    ).thenResolve(response);

    const result = await client.execute(request);
    expect(result).toEqual(response);

    const [funcNameArg, funcArgsArg, resultClassArg]: any[] = capture(
      serviceMock.callFunctionInternal
    ).last();

    expect("delete").toEqual(funcNameArg);
    expect(1).toEqual(funcArgsArg.length);
    const expectedArgs = {
      authUrl: expectedAuthUrl,
      body: expectedBody,
      cookies: expectedCookies,
      encodeBodyAsJSON: false,
      followRedirects: true,
      form: expectedForm,
      headers: expectedHeaders,
      url: expectedUrl
    };
    expect(expectedArgs).toEqual(funcArgsArg[0]);
    expect(ResultDecoders.HttpResponseDecoder).toEqual(resultClassArg);

    when(
      serviceMock.callFunctionInternal(anything(), anything(), anything())
    ).thenThrow(new Error("whoops"));
    // Should pass along errors
    try {
      await client.execute(request);
      fail();
    } catch (_) {}
  });
});
