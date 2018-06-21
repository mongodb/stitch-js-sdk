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
import StitchUserProfileImpl from "../StitchUserProfileImpl";
import StoreCoreUserProfile from "./StoreCoreUserProfile";
import StoreStitchUserIdentity from "./StoreStitchUserIdentity";

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
    new StoreCoreUserProfile(
      authInfo.userProfile!.userType!, 
      authInfo.userProfile!.data,
      authInfo.userProfile!.identities.map(
        identity => new StoreStitchUserIdentity(identity.id, identity.providerType)
      )
    )
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
      StoreCoreUserProfile.decode(userProfile)
    );
  }

  public constructor(
    userId: string,
    deviceId: string,
    accessToken: string,
    refreshToken: string,
    loggedInProviderType: string,
    loggedInProviderName: string,
    public readonly userProfile: StoreCoreUserProfile
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
    to[Fields.USER_PROFILE] = this.userProfile.encode();

    return to;
  }
}

export { StoreAuthInfo, readFromStorage, writeToStorage };
