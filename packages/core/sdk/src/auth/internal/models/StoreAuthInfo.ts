/**
 * Copyright 2018-present MongoDB, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { Storage } from "../../../internal/common/Storage";

import AuthInfo from "../AuthInfo";
import StoreCoreUserProfile from "./StoreCoreUserProfile";
import StoreStitchUserIdentity from "./StoreStitchUserIdentity";
import StitchClientError from "../../../StitchClientError";
import { StitchClientErrorCode } from "../../../StitchClientErrorCode";


enum Fields {
  USER_ID = "user_id",
  DEVICE_ID = "device_id",
  ACCESS_TOKEN = "access_token",
  REFRESH_TOKEN = "refresh_token",
  LAST_AUTH_ACTIVITY = "last_auth_activity",
  LOGGED_IN_PROVIDER_TYPE = "logged_in_provider_type",
  LOGGED_IN_PROVIDER_NAME = "logged_in_provider_name",
  USER_PROFILE = "user_profile"
}

function readActiveUserFromStorage(storage: Storage): AuthInfo | undefined {
  const rawInfo = storage.get(StoreAuthInfo.ACTIVE_USER_STORAGE_NAME);
  if (!rawInfo) {
    return undefined;
  }

  return StoreAuthInfo.decode(JSON.parse(rawInfo));
}

function readCurrentUsersFromStorage(storage: Storage): Map<string, AuthInfo> {
  const rawInfo = storage.get(StoreAuthInfo.ALL_USERS_STORAGE_NAME);
  if (!rawInfo) {
    return new Map<string, AuthInfo>();
  }

  const rawArray = JSON.parse(rawInfo);
  if (!Array.isArray(rawArray)) {
    // the raw data is expected to be an array
    throw new StitchClientError(
      StitchClientErrorCode.CouldNotLoadPersistedAuthInfo
    );
  }

  const userIdToAuthInfoMap = new Map<string, AuthInfo>();
  rawArray.forEach(rawEntry => {
    const authInfo = StoreAuthInfo.decode(rawEntry);
    userIdToAuthInfoMap.set(authInfo.userId!, authInfo);
  })

  return userIdToAuthInfoMap;
}

function writeActiveUserAuthInfoToStorage(
  authInfo: AuthInfo, 
  storage: Storage
) {
  if (authInfo.isEmpty) {
    storage.remove(StoreAuthInfo.ACTIVE_USER_STORAGE_NAME);
    return;
  }

  const info = new StoreAuthInfo(
    authInfo.userId!,
    authInfo.deviceId!,
    authInfo.accessToken!,
    authInfo.refreshToken!,
    authInfo.loggedInProviderType!,
    authInfo.loggedInProviderName!,
    authInfo.lastAuthActivity!,
    authInfo.userProfile
      ? new StoreCoreUserProfile(
          authInfo.userProfile!.userType!,
          authInfo.userProfile!.data,
          authInfo.userProfile!.identities.map(
            identity =>
              new StoreStitchUserIdentity(identity.id, identity.providerType)
          )
        )
      : undefined
  );
  storage.set(StoreAuthInfo.ACTIVE_USER_STORAGE_NAME, JSON.stringify(info.encode()));
}

function writeAllUsersAuthInfoToStorage(
  currentUsersAuthInfo: Map<string, AuthInfo>,
  storage: Storage
) {
  const encodedStoreInfos: any[] = []
  for (var [userId, authInfo] of currentUsersAuthInfo) {
    const storeInfo = new StoreAuthInfo(
      userId,
      authInfo.deviceId!,
      authInfo.accessToken!,
      authInfo.refreshToken!,
      authInfo.loggedInProviderType!,
      authInfo.loggedInProviderName!,
      authInfo.lastAuthActivity!,
      authInfo.userProfile
        ? new StoreCoreUserProfile(
            authInfo.userProfile!.userType!,
            authInfo.userProfile!.data,
            authInfo.userProfile!.identities.map(
              identity =>
                new StoreStitchUserIdentity(identity.id, identity.providerType)
            )
          )
        : undefined
    );

    encodedStoreInfos.push(storeInfo.encode());
  }

  storage.set(
    StoreAuthInfo.ALL_USERS_STORAGE_NAME, 
    JSON.stringify(encodedStoreInfos)
  );
}

class StoreAuthInfo extends AuthInfo {
  public static readonly ACTIVE_USER_STORAGE_NAME: string = "auth_info";
  public static readonly ALL_USERS_STORAGE_NAME: string = "all_auth_infos";

  public static decode(from: any): StoreAuthInfo {
    const userId = from[Fields.USER_ID];
    const deviceId = from[Fields.DEVICE_ID];
    const accessToken = from[Fields.ACCESS_TOKEN];
    const refreshToken = from[Fields.REFRESH_TOKEN];
    const loggedInProviderType = from[Fields.LOGGED_IN_PROVIDER_TYPE];
    const loggedInProviderName = from[Fields.LOGGED_IN_PROVIDER_NAME];
    const userProfile = from[Fields.USER_PROFILE];
    const lastAuthActivityMillisSinceEpoch = from[Fields.LAST_AUTH_ACTIVITY];

    return new StoreAuthInfo(
      userId,
      deviceId,
      accessToken,
      refreshToken,
      loggedInProviderType,
      loggedInProviderName,
      new Date(lastAuthActivityMillisSinceEpoch),
      StoreCoreUserProfile.decode(userProfile),
    );
  }

  public constructor(
    userId: string,
    deviceId: string,
    accessToken: string,
    refreshToken: string,
    loggedInProviderType: string,
    loggedInProviderName: string,
    lastAuthActivity: Date,
    public readonly userProfile?: StoreCoreUserProfile,
  ) {
    super(
      userId,
      deviceId,
      accessToken,
      refreshToken,
      loggedInProviderType,
      loggedInProviderName,
      lastAuthActivity,
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
    to[Fields.LAST_AUTH_ACTIVITY] = this.lastAuthActivity
      ? this.lastAuthActivity.getTime()
      : undefined;
    to[Fields.USER_PROFILE] = this.userProfile
      ? this.userProfile.encode()
      : undefined;

    return to;
  }
}

export { 
  StoreAuthInfo, 
  readActiveUserFromStorage, 
  readCurrentUsersFromStorage, 
  writeActiveUserAuthInfoToStorage, 
  writeAllUsersAuthInfoToStorage 
};
