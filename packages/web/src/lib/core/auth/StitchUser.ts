import { Codec, CoreStitchUser, StitchCredential } from "stitch-core";
import StitchAuthImpl from "./internal/StitchAuthImpl";
import StitchUserImpl from "./internal/StitchUserImpl";

export interface StitchUser extends CoreStitchUser {
  linkWithCredential(credential: StitchCredential): Promise<StitchUser>;
}

enum Fields {
  UserId = "user_id",
  LoggedInProviderType = "logged_in_provider_type",
  LoggedInProviderName = "logged_in_provider_name",
  UserProfile = "user_profile"
}

export class StitchUserCodec implements Codec<StitchUser> {
  constructor(private readonly auth: StitchAuthImpl) {
  }

  public decode(from: object): StitchUser {
    return new StitchUserImpl(
      from[Fields.UserId],
      from[Fields.LoggedInProviderType],
      from[Fields.LoggedInProviderName],
      from[Fields.UserProfile],
      this.auth
    )
  }

  public encode(from: StitchUser): object {
    return {
      [Fields.UserId]: from.id,
      [Fields.LoggedInProviderType]: from.loggedInProviderType,
      [Fields.LoggedInProviderName]: from.loggedInProviderName,
      [Fields.UserProfile]: from.profile
    }
  }
}
