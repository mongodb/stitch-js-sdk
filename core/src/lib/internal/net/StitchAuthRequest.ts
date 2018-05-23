import StitchRequest from "./StitchRequest";

export class StitchAuthRequest extends StitchRequest {
  public readonly useRefreshToken: boolean;

  public constructor(request: StitchRequest, useRefreshToken: boolean) {
    super(
      request.method,
      request.path,
      request.headers,
      request.startedAt,
      request.body
    );
    this.useRefreshToken = useRefreshToken;
  }

  public get builder() {
    return new StitchAuthRequest.Builder(this);
  }
}

export namespace StitchAuthRequest {
  export class Builder extends StitchRequest.Builder {
    public useRefreshToken: boolean;

    public constructor(request?: StitchAuthRequest) {
      super(request);
    }

    public withAccessToken(): this {
      this.useRefreshToken = false;
      return this;
    }

    public withRefreshToken(): this {
      this.useRefreshToken = true;
      return this;
    }

    public build(): StitchAuthRequest {
      return new StitchAuthRequest(super.build(), this.useRefreshToken);
    }
  };
}
