import Method from "./Method";

export default class StitchRequest {
  public static Builder = class {
    public method?: Method;
    public path?: string;
    public headers?: { [key: string]: string };
    public body?: string;
    public startedAt?: number;

    public constructor(request?: StitchRequest) {
      if (request !== undefined) {
        this.method = request.method;
        this.path = request.path;
        this.headers = request.headers;
        this.body = request.body;
        this.startedAt = request.startedAt;
      }
    }

    public withMethod(method: Method): this {
      this.method = method;
      return this;
    }

    public withPath(path: string): this {
      this.path = path;
      return this;
    }

    public withHeaders(headers: { [key: string]: string }): this {
      this.headers = headers;
      return this;
    }

    public withBody(body: string): this {
      this.body = body;
      return this;
    }

    public build(): StitchRequest {
      if (this.method === undefined) {
        throw Error("must set method");
      }
      if (this.path === undefined) {
        throw Error("must set non-empty path");
      }
      if (this.startedAt === undefined) {
        this.startedAt = Date.now() / 1000;
      }
      return new StitchRequest(
        this.method,
        this.path,
        this.headers === undefined ? {} : this.headers,
        this.startedAt,
        this.body
      );
    }
  };

  public readonly method: Method;
  public readonly path: string;
  public readonly headers: { [key: string]: string };
  public readonly body?: string;
  public readonly startedAt: number;

  public constructor(
    method: Method,
    path: string,
    headers: { [key: string]: string },
    startedAt: number,
    body?: string
  ) {
    this.method = method;
    this.path = path;
    this.headers = headers;
    this.body = body;
    this.startedAt = startedAt;
  }

  public get builder() {
    return new StitchRequest.Builder(this);
  }
}
