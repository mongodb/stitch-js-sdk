import StitchUserIdentity from "../../StitchUserIdentity";

enum Fields {
  ID = "id",
  PROVIDER_TYPE = "provider_type"
}

/**
 * A class describing the structure of how user identity information is stored in persisted `Storage`.
 */
export default class StoreStitchUserIdentity extends StitchUserIdentity {
  /**
   * The id of this identity in MongoDB Stitch
   *
   * - important: This is **not** the id of the Stitch user.
   */
  public id: string;
  /**
   * A string indicating the authentication provider that provides this identity.
   */
  public providerType: string;

  public constructor(id: string, providerType: string) {
    super(id, providerType);
  }
}
