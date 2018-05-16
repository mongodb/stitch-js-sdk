import StitchRequest from "./StitchRequest";

export default class StitchAuthRequest extends StitchRequest {
  public static Builder = class extends StitchRequest.Builder {
    private useRefreshToken: boolean;

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

  public readonly useRefreshToken: boolean;

  public constructor(request: StitchRequest, useRefreshToken: boolean) {
    super(
      request.method,
      request.path,
      request.headers,
      request.body,
      request.startedAt
    );
    this.useRefreshToken = useRefreshToken;
  }

  public get builder() {
    return new StitchAuthRequest.Builder(this);
  }
}
