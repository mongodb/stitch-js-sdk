import Method from "./Method";
import StitchAuthRequest from "./StitchAuthRequest";
import StitchRequest from "./StitchRequest";

export default class StitchAuthDocRequest extends StitchAuthRequest {
  public static Builder = class extends StitchRequest.Builder {
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
      return new StitchAuthDocRequest(super.build(), document);
    }
  };

  public readonly document: object;

  public constructor(request: StitchRequest, document: object) {
    super(request, false);
    this.document = document;
  }

  public get builder() {
    return new StitchAuthRequest.Builder(this);
  }
}
