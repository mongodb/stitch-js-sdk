import StitchUserIdentity from "../../StitchUserIdentity";

enum Fields {
  ID = "id",
  PROVIDER_TYPE = "provider_type"
}

export default class APIStitchUserIdentity extends StitchUserIdentity {
  public static fromJSON(json: object): APIStitchUserIdentity {
    return new APIStitchUserIdentity(
      json[Fields.ID],
      json[Fields.PROVIDER_TYPE]
    );
  }

  protected constructor(id: string, providerType: string) {
    super(id, providerType);
  }

  public toJSON(): object {
    return {
      [Fields.ID]: this.id,
      [Fields.PROVIDER_TYPE]: this.providerType
    };
  }
}
