import StitchUserIdentity from "../StitchUserIdentity";
import StitchUserProfile from "../StitchUserProfile";

/**
 * The set of properties that describe an authenticated Stitch user.
 */
export default interface CoreStitchUser {
  /**
   * The id of the Stitch user.
   */
  readonly id: string;
  /**
   * The type of authentication provider used to log in as this user.
   */
  readonly loggedInProviderType: string;
  /**
   * The name of the authentication provider used to log in as this user.
   */
  readonly loggedInProviderName: string;
  /**
   * A string describing the type of this user. (Either `server` or `normal`)
   */
  readonly userType?: string;
  /**
   * A `StitchUserProfile` object describing this user.
   */
  readonly profile: StitchUserProfile;
  /**
   * An array of `StitchUserIdentity` objects representing the identities linked
   * to this user which can be used to log in as this user.
   */
  readonly identities: StitchUserIdentity[];
}
