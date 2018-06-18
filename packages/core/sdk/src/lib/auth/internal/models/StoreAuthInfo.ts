import { Storage } from "../../../internal/common/Storage";

import AuthInfo from "../AuthInfo";
import StitchUserProfileImpl from "../StitchUserProfileImpl";
import StoreCoreUserProfile from "./StoreCoreUserProfile";

enum Fields {
  USER_ID = "user_id",
  DEVICE_ID = "device_id",
  ACCESS_TOKEN = "access_token",
  REFRESH_TOKEN = "refresh_token",
  LOGGED_IN_PROVIDER_TYPE = "logged_in_provider_type",
  LOGGED_IN_PROVIDER_NAME = "logged_in_provider_name",
  USER_PROFILE = "user_profile"
}

function readFromStorage(storage: Storage): AuthInfo | undefined {
  const rawInfo = storage.get(StoreAuthInfo.STORAGE_NAME);
  if (!rawInfo) {
    return undefined;
  }

  return StoreAuthInfo.decode(JSON.parse(rawInfo));
}

function writeToStorage(authInfo: AuthInfo, storage: Storage) {
  const info = new StoreAuthInfo(
    authInfo.userId!,
    authInfo.deviceId!,
    authInfo.accessToken!,
    authInfo.refreshToken!,
    authInfo.loggedInProviderType!,
    authInfo.loggedInProviderName!,
    authInfo.userProfile!
  );
  storage.set(StoreAuthInfo.STORAGE_NAME, JSON.stringify(info.encode()));
}

class StoreAuthInfo extends AuthInfo {
  public static readonly STORAGE_NAME: string = "auth_info";

  public static decode(from: object): StoreAuthInfo {
    const userId = from[Fields.USER_ID];
    const deviceId = from[Fields.DEVICE_ID];
    const accessToken = from[Fields.ACCESS_TOKEN];
    const refreshToken = from[Fields.REFRESH_TOKEN];
    const loggedInProviderType = from[Fields.LOGGED_IN_PROVIDER_TYPE];
    const loggedInProviderName = from[Fields.LOGGED_IN_PROVIDER_NAME];
    const userProfile = from[Fields.USER_PROFILE];

    return new StoreAuthInfo(
      userId,
      deviceId,
      accessToken,
      refreshToken,
      loggedInProviderType,
      loggedInProviderName,
      userProfile
    );
  }

  public constructor(
    userId: string,
    deviceId: string,
    accessToken: string,
    refreshToken: string,
    loggedInProviderType: string,
    loggedInProviderName: string,
    userProfile: StitchUserProfileImpl
  ) {
    super(
      userId,
      deviceId,
      accessToken,
      refreshToken,
      loggedInProviderType,
      loggedInProviderName,
      userProfile
    );
  }

  public encode(): object {
    const to: object = {};

    to[Fields.USER_ID] = this.userId;
    to[Fields.ACCESS_TOKEN] = this.accessToken;
    to[Fields.REFRESH_TOKEN] = this.refreshToken;
    to[Fields.DEVICE_ID] = this.deviceId;
    to[Fields.LOGGED_IN_PROVIDER_NAME] = this.loggedInProviderName;
    to[Fields.LOGGED_IN_PROVIDER_TYPE] = this.loggedInProviderType;
    to[Fields.USER_PROFILE] = this.userProfile;

    return to;
  }
}

export { StoreAuthInfo, readFromStorage, writeToStorage };
