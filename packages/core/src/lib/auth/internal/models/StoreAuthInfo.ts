import { Storage } from "../../../internal/common/Storage";

import { Codec } from "../../../internal/common/Codec";
import AuthInfo from "../AuthInfo";
import StitchUserProfileImpl from "../StitchUserProfileImpl";
import StoreCoreUserProfile, { StoreCoreUserProfileCodec } from "./StoreCoreUserProfile";

enum Fields {
  UserId = "user_id",
  DeviceId = "device_id",
  AccessToken = "access_token",
  RefreshToken = "refresh_token",
  LoggedInProviderType = "logged_in_provider_type",
  LoggedInProviderName = "logged_in_provider_name",
  UserProfile = "user_profile"
}

class StoreAuthInfo extends AuthInfo {
  public static readonly STORAGE_NAME: string = "auth_info";

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
}

const storeCoreUserProfileCodec = new StoreCoreUserProfileCodec();

class StoreAuthInfoCodec implements Codec<StoreAuthInfo> {
  public decode(from: object): StoreAuthInfo {
    const userId = from[Fields.UserId];
    const deviceId = from[Fields.DeviceId];
    const accessToken = from[Fields.AccessToken];
    const refreshToken = from[Fields.RefreshToken];
    const loggedInProviderType = from[Fields.LoggedInProviderType];
    const loggedInProviderName = from[Fields.LoggedInProviderName];
    const userProfile = from[Fields.UserProfile];

    return new StoreAuthInfo(
      from[Fields.UserId],
      from[Fields.DeviceId],
      from[Fields.AccessToken],
      from[Fields.RefreshToken],
      from[Fields.LoggedInProviderType],
      from[Fields.LoggedInProviderName],
      storeCoreUserProfileCodec.decode(from[Fields.UserProfile])
    );
  }

  public encode(storeAuthInfo: StoreAuthInfo): object {
    const to: object = {};

    to[Fields.UserId] = storeAuthInfo.userId;
    to[Fields.AccessToken] = storeAuthInfo.accessToken;
    to[Fields.RefreshToken] = storeAuthInfo.refreshToken;
    to[Fields.DeviceId] = storeAuthInfo.deviceId;
    to[Fields.LoggedInProviderName] = storeAuthInfo.loggedInProviderName;
    to[Fields.LoggedInProviderType] = storeAuthInfo.loggedInProviderType;

    if (storeAuthInfo.userProfile) {
      to[Fields.UserProfile] = storeCoreUserProfileCodec.encode(
        new StoreCoreUserProfile(
          storeAuthInfo.userProfile.userType, 
          storeAuthInfo.userProfile.data, 
          storeAuthInfo.userProfile.identities
        )
      );
    }
   

    return to;
  }
}

const storeAuthInfoCodec = new StoreAuthInfoCodec();

function readFromStorage(storage: Storage): AuthInfo | undefined {
  const rawInfo = storage.get(StoreAuthInfo.STORAGE_NAME);
  if (!rawInfo) {
    return undefined;
  }

  return storeAuthInfoCodec.decode(JSON.parse(rawInfo));
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
  storage.set(StoreAuthInfo.STORAGE_NAME, JSON.stringify(storeAuthInfoCodec.encode(info)));
}

export { StoreAuthInfo, StoreAuthInfoCodec, readFromStorage, writeToStorage };
