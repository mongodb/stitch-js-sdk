import { StitchRequest } from "./StitchRequest";

export class StitchDocRequest extends StitchRequest {
  public readonly document: object;

  constructor(request: StitchRequest, document: object) {
    super(
      request.method,
      request.path,
      request.headers,
      request.startedAt,
      request.body
    );

    this.document = document;
  }

  public get builder(): StitchDocRequest.Builder {
    return new StitchDocRequest.Builder(this);
  }
}

export namespace StitchDocRequest {
  export class Builder extends StitchRequest.Builder {
    public document: object;

    constructor(request?: StitchDocRequest) {
      super(request);

      if (request !== undefined) {
        this.document = request.document;
      }
    }

    public withDocument(document: object): this {
      this.document = document;
      return this;
    }

    public build(): StitchDocRequest {
      return new StitchDocRequest(super.build(), this.document);
    }
  };
}
