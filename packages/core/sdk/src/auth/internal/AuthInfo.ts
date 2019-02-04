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

import StitchUserProfileImpl from "./StitchUserProfileImpl";

/**
 * @hidden
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
   * Whether or not this auth info is associated with a user.
   */
  public get hasUser(): boolean {
    return this.userId === undefined;
  }

  /**
   * An empty auth info is an auth info associated with no device ID.
   */
  public get isEmpty(): boolean {
    return this.deviceId === undefined;
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
      this.userId,
      this.deviceId,
      undefined,
      undefined,
      this.loggedInProviderType,
      this.loggedInProviderName,
      this.userProfile
    );
  }

  public withClearedUser(): AuthInfo {
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

  public withAuthProvider(providerType: string, providerName: string) {
    return new AuthInfo(
      this.userId,
      this.deviceId,
      this.accessToken,
      this.refreshToken,
      providerType,
      providerName,
      this.userProfile
    );
  }

  public get isLoggedIn(): boolean {
    return this.accessToken !== undefined && this.refreshToken !== undefined;
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
