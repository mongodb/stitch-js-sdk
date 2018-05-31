import { StitchRequest } from "./StitchRequest";

export class StitchAuthRequest extends StitchRequest {
  public constructor(
    request: StitchRequest,
    public readonly useRefreshToken: boolean = false,
    public readonly shouldRefreshOnFailure: boolean = true
  ) {
    super(
      request.method,
      request.path,
      request.headers,
      request.startedAt,
      request.body
    );
  }

  public get builder(): StitchAuthRequest.Builder {
    return new StitchAuthRequest.Builder(this);
  }
}

export namespace StitchAuthRequest {
  export class Builder extends StitchRequest.Builder {
    public useRefreshToken: boolean;
    public shouldRefreshOnFailure: boolean;

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

    public withShouldRefreshOnFailure(shouldRefreshOnFailure: boolean): this {
      this.shouldRefreshOnFailure = shouldRefreshOnFailure;
      return this;
    }

    public build(): StitchAuthRequest {
      return new StitchAuthRequest(
        super.build(),
        this.useRefreshToken,
        this.shouldRefreshOnFailure
      );
    }
  }
}
