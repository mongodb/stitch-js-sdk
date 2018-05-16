import StitchUserIdentity from "../../StitchUserIdentity";

enum Fields {
  ID = "id",
  PROVIDER_TYPE = "provider_type"
}

export default class APIStitchUserIdentity extends StitchUserIdentity {
  public static decodeFrom(body: object): APIStitchUserIdentity {
    return new APIStitchUserIdentity(
      body[Fields.ID],
      body[Fields.PROVIDER_TYPE]
    );
  }

  private constructor(id: string, providerType: string) {
    super(id, providerType);
  }
}
