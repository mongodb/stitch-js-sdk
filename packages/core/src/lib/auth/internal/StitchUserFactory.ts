import CoreStitchUser from "./CoreStitchUser";
import StitchUserProfileImpl from "./StitchUserProfileImpl";

/**
 * An interface describing a factory that produces a generic Stitch user object conforming to `CoreStitchUser`.
 */
interface StitchUserFactory<T extends CoreStitchUser> {
  /**
   * The factory function which will produce the user with the provided id, logged in provider type/name, and a user
   * profile.
   */
  makeUser(
    id: string,
    loggedInProviderType: string,
    loggedInProviderName: string,
    userProfile?: StitchUserProfileImpl
  ): T;
}

export default StitchUserFactory;
