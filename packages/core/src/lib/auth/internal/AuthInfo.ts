import StitchUserProfile from "../StitchUserProfile";
import StitchUserProfileImpl from "./StitchUserProfileImpl";

/**
 * A class representing the combined information represented by a user.
 */
export default class AuthInfo {
  public static empty(): AuthInfo {
    return new AuthInfo(
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined
    );
  }
  /**
   * The id of the Stitch user.
   */
  public readonly userId?: string;
  /**
   * The device id.
   */
  public readonly deviceId?: string;
  /**
   * The temporary access token for the user.
   */
  public readonly accessToken?: string;
  /**
   * The permanent (though potentially invalidated) refresh token for the user.
   */
  public readonly refreshToken?: string;
  /**
   * The type of authentication provider used to log into the current session.
   */
  public readonly loggedInProviderType?: string;
  /**
   * A string indicating the name of authentication provider used to log into the current session.
   */
  public readonly loggedInProviderName?: string;
  /**
   * The profile of the currently authenticated user as a `StitchUserProfile`.
   */
  public readonly userProfile?: StitchUserProfileImpl;

  public constructor(
    userId?: string,
    deviceId?: string,
    accessToken?: string,
    refreshToken?: string,
    loggedInProviderType?: string,
    loggedInProviderName?: string,
    userProfile?: StitchUserProfileImpl
  ) {
    this.userId = userId;
    this.deviceId = deviceId;
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
    this.loggedInProviderType = loggedInProviderType;
    this.loggedInProviderName = loggedInProviderName;
    this.userProfile = userProfile;
  }

  public loggedOut(): AuthInfo {
    return new AuthInfo(
      undefined,
      this.deviceId,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined
    );
  }

  /**
   * Merges a new `AuthInfo` into some existing `AuthInfo`.
   */
  public merge(newInfo: AuthInfo): AuthInfo {
    return new AuthInfo(
      newInfo.userId === undefined ? this.userId : newInfo.userId,
      newInfo.deviceId === undefined ? this.deviceId : newInfo.deviceId,
      newInfo.accessToken === undefined
        ? this.accessToken
        : newInfo.accessToken,
      newInfo.refreshToken === undefined
        ? this.refreshToken
        : newInfo.refreshToken,
      newInfo.loggedInProviderType === undefined
        ? this.loggedInProviderType
        : newInfo.loggedInProviderType,
      newInfo.loggedInProviderName === undefined
        ? this.loggedInProviderName
        : newInfo.loggedInProviderName,
      newInfo.userProfile === undefined ? this.userProfile : newInfo.userProfile
    );
  }
}
