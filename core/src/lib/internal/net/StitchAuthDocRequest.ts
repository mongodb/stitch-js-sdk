import Method from "./Method";
import { StitchAuthRequest } from "./StitchAuthRequest";
import { StitchRequest } from "./StitchRequest";
import Headers from "./Headers";
import ContentTypes from "./ContentTypes";
import { stringify } from "mongodb-extjson";

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

    public constructor(request?: StitchAuthDocRequest) {
      super(request);

      if (request !== undefined) {
        this.document = request!.document;
        this.useRefreshToken = request!.useRefreshToken;
      }
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
      if (this.document === undefined || !(this.document instanceof Object)) {
        throw new Error("document must be set: " + this.document);
      }
      if (this.headers === undefined) {
        this.withHeaders({});
      }
      this.headers![Headers.CONTENT_TYPE] = ContentTypes.APPLICATION_JSON;
      this.withBody(stringify(this.document));
      return new StitchAuthDocRequest(super.build(), this.document);
    }
  }
}
