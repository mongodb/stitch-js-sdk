import { Codec } from "../../..";
import StitchUserProfileImpl from "../StitchUserProfileImpl";
import { StoreStitchUserIdentity, StoreStitchUserIdentityCodec } from "./StoreStitchUserIdentity";

enum Fields {
  Data = "data",
  UserType = "user_type",
  Identities = "identities"
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

const storeStitchUserIdentityCodec = new StoreStitchUserIdentityCodec();

export class StoreCoreUserProfileCodec implements Codec<StoreCoreUserProfile> {
  public decode(from: object): StoreCoreUserProfile {
    return new StoreCoreUserProfile(
      from[Fields.UserType],
      from[Fields.Data],
      from[Fields.Identities].map(it => storeStitchUserIdentityCodec.decode(it))
    );
  }

  public encode(from: StoreCoreUserProfile): object {
    return {
      [Fields.Data]: from.data,
      [Fields.Identities]: from.identities.map(it => storeStitchUserIdentityCodec.encode(it)),
      [Fields.UserType]: from.userType,
    }
  }
}
