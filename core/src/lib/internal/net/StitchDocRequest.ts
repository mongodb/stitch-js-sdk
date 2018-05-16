import StitchRequest from "./StitchRequest";

export default class StitchDocRequest extends StitchRequest {
  public static Builder = class extends StitchRequest.Builder {
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

  public readonly document: object;

  constructor(request: StitchRequest, document: object) {
    super(
      request.method,
      request.path,
      request.headers,
      request.body,
      request.startedAt
    );

    this.document = document;
  }

  public get builder() {
    return new StitchDocRequest.Builder(this);
  }
}
