import StitchUserProfileImpl from "../StitchUserProfileImpl";
import StoreStitchUserIdentity from "./StoreStitchUserIdentity";

enum Fields {
  DATA = "data",
  USER_TYPE = "user_type",
  IDENTITIES = "identities"
}

/**
 * A class describing the structure of how user profile information is stored in persisted `Storage`.
 */
export default class StoreCoreUserProfile extends StitchUserProfileImpl {
  /**
   * A string describing the type of this user. (Either `server` or `normal`)
   */
  public userType: string;
  /**
   * An object containing extra metadata about the user as supplied by the authentication provider.
   */
  public data: { [key: string]: string };
  /**
   * An array of `StitchUserIdentity` objects representing the identities linked
   * to this user which can be used to log in as this user.
   */
  public identities: StoreStitchUserIdentity[];
}
