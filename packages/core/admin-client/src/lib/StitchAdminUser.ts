import {
  CoreStitchUser,
  StitchUserFactory,
  StitchUserIdentity,
  StitchUserProfile,
  StitchUserProfileImpl
} from "mongodb-stitch-core-sdk";

class StitchAdminUser implements CoreStitchUser {
  /**
   * The String representation of the id of this Stitch user.
   */
  public readonly id: string;

  /**
   * A string describing the type of authentication provider used to log in as this user.
   */
  public readonly loggedInProviderType: string;

  /**
   * The name of the authentication provider used to log in as this user.
   */
  public readonly loggedInProviderName: string;

  /**
   * A string describing the type of this user. (Either `server` or `normal`)
   */
  public get userType(): string {
    return this.profile.userType!;
  }

  /**
   * A `StitchCore.StitchUserProfile` object describing this user.
   */
  public readonly profile: StitchUserProfileImpl;

  /**
   * An array of `StitchCore.StitchUserIdentity` objects representing the identities linked
   * to this user which can be used to log in as this user.
   */
  public get identities(): StitchUserIdentity[] {
    return this.profile.identities;
  }

  /**
   * Initializes this user with its basic properties.
   */
  public constructor(
    id: string,
    providerType: string,
    providerName: string,
    userProfile: StitchUserProfileImpl
  ) {
    this.id = id;
    this.loggedInProviderType = providerType;
    this.loggedInProviderName = providerName;
    this.profile = userProfile;
  }
}

class StitchAdminUserFactory implements StitchUserFactory<StitchAdminUser> {
  /**
   * The factory function which can produce a `StitchAdminUser` with the provided id, logged in provider type/name,
   * and a user profile.
   */
  public makeUser(
    id: string,
    loggedInProviderType: string,
    loggedInProviderName: string,
    userProfile?: StitchUserProfileImpl
  ): StitchAdminUser {
    return new StitchAdminUser(
      id,
      loggedInProviderType,
      loggedInProviderName,
      userProfile!
    );
  }
}

export { StitchAdminUser, StitchAdminUserFactory };
