import Method from "./Method";
import { StitchAuthRequest } from "./StitchAuthRequest";
import { StitchRequest } from "./StitchRequest";

export class StitchAuthDocRequest extends StitchAuthRequest {
  public readonly document: object;

  public constructor(request: StitchRequest, document: object) {
    super(request, false);
    this.document = document;
  }

  public get builder(): StitchAuthDocRequest.Builder {
    return new StitchAuthDocRequest.Builder(this);
  }
}

export namespace StitchAuthDocRequest {
  export class Builder extends StitchAuthRequest.Builder {
    public document: object;
    public useRefreshToken: boolean;

    public constructor(request?: StitchAuthRequest) {
      super(request);
    }

    public withDocument(document: object): this {
      this.document = document;
      return this;
    }

    public withAccessToken(): this {
      this.useRefreshToken = false;
      return this;
    }

    public withRefreshToken(): this {
      this.useRefreshToken = true;
      return this;
    }

    public build(): StitchAuthDocRequest {
      return new StitchAuthDocRequest(super.build(), this.document);
    }
  };
}
