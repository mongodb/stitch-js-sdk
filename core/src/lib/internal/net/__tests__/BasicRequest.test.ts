import BasicRequest from "../BasicRequest";
import Method from "../Method";

describe("BasicRequest", () => {
  it("should throw if missing Method", () => {
    const builder = new BasicRequest.Builder();
    builder.withURL("http://localhost:8080");
    expect(() => builder.build()).toThrowError();
  });

  it("should throw if missing URL", () => {
    const builder = new BasicRequest.Builder();
    builder.withMethod(Method.GET);
    expect(() => builder.build()).toThrowError();
  });

  it("should initialize", () => {
    const method = Method.GET;
    const url = "http://localhost:8080";
    const headers = { foo: "bar" };
    const body = JSON.stringify([1, 2, 3]);

    const builder = new BasicRequest.Builder();

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
