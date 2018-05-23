import Method from "./Method";

export class BasicRequest {
  public readonly method: Method;
  public readonly url: string;
  public readonly headers: { [key: string]: string };
  public readonly body?: string;

  public constructor(
    method: Method,
    url: string,
    headers: { [key: string]: string },
    body?: string
  ) {
    this.method = method;
    this.url = url;
    this.headers = headers;
    this.body = body;
  }
}

export namespace BasicRequest {
  export class Builder {
    public method?: Method;
    public url?: string;
    public headers?: { [key: string]: string };
    public body?: string;

    public constructor(request?: BasicRequest) {
      if (!request) {
        return;
      }

      this.method = request.method;
      this.url = request.url;
      this.headers = request.headers;
      this.body = request.body;
    }

    public withMethod(method: Method): this {
      this.method = method;
      return this;
    }

    public withURL(url: string): this {
      this.url = url;
      return this;
    }

    public withHeaders(headers: { [key: string]: string }): this {
      this.headers = headers;
      return this;
    }

    public withBody(body?: string): this {
      this.body = body;
      return this;
    }

    public build(): BasicRequest {
      if (this.method === undefined) {
        throw new Error("must set method");
      }
      if (this.url === undefined) {
        throw new Error("must set non-empty url");
      }
      return new BasicRequest(
        this.method,
        this.url,
        this.headers === undefined
          ? ({} as { [key: string]: string })
          : this.headers,
        this.body
      );
    }
  };
}
