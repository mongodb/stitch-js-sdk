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

import { StitchUserProfileImpl } from "../../../../src";
import AuthInfo from "../../../../src/auth/internal/AuthInfo";
import StoreStitchUserIdentity from "../../../../src/auth/internal/models/StoreStitchUserIdentity";

describe("AuthInfo", () => {
  const userId = "foo";
  const deviceId = "bar";
  const accessToken = "baz";
  const refreshToken = "qux";
  const loggedInProviderName = "quux";
  const loggedInProviderType = "corge";

  const userType = "fred";
  const id = "wibble";
  const providerType = "wobble";

  const identities = [new StoreStitchUserIdentity(id, providerType)];
  const userProfile = new StitchUserProfileImpl(userType, {}, identities);

  it("should contain all fields when constructed", () => {
    const authInfo = new AuthInfo(
      userId,
      deviceId,
      accessToken,
      refreshToken,
      loggedInProviderType,
      loggedInProviderName,
      userProfile
    );

    expect(authInfo.userId).toEqual(userId);
    expect(authInfo.deviceId).toEqual(deviceId);
    expect(authInfo.accessToken).toEqual(accessToken);
    expect(authInfo.refreshToken).toEqual(refreshToken);
    expect(authInfo.loggedInProviderName).toEqual(loggedInProviderName);
    expect(authInfo.loggedInProviderType).toEqual(loggedInProviderType);
    expect(authInfo.userProfile).toEqual(userProfile);
  });

  it("should be empty when empty() is called", () => {
    const authInfo = AuthInfo.empty();

    expect(authInfo.userId).toEqual(undefined);
    expect(authInfo.deviceId).toEqual(undefined);
    expect(authInfo.accessToken).toEqual(undefined);
    expect(authInfo.refreshToken).toEqual(undefined);
    expect(authInfo.loggedInProviderName).toEqual(undefined);
    expect(authInfo.loggedInProviderType).toEqual(undefined);
    expect(authInfo.userProfile).toEqual(undefined);
  });

  it("must have deviceId, but nothing else if user cleared", () => {
    const authInfo = new AuthInfo(
      userId,
      deviceId,
      accessToken,
      refreshToken,
      loggedInProviderType,
      loggedInProviderName,
      userProfile
    ).withClearedUser();

    expect(authInfo.userId).toEqual(undefined);
    expect(authInfo.deviceId).toEqual(deviceId);
    expect(authInfo.accessToken).toEqual(undefined);
    expect(authInfo.refreshToken).toEqual(undefined);
    expect(authInfo.loggedInProviderName).toEqual(undefined);
    expect(authInfo.loggedInProviderType).toEqual(undefined);
    expect(authInfo.userProfile).toEqual(undefined);
  });

  it("must have all fields except tokens when logged out", () => {
    const authInfo = new AuthInfo(
      userId,
      deviceId,
      accessToken,
      refreshToken,
      loggedInProviderType,
      loggedInProviderName,
      userProfile
    ).loggedOut();

    expect(authInfo.userId).toEqual(userId);
    expect(authInfo.deviceId).toEqual(deviceId);
    expect(authInfo.accessToken).toEqual(undefined);
    expect(authInfo.refreshToken).toEqual(undefined);
    expect(authInfo.loggedInProviderName).toEqual(loggedInProviderName);
    expect(authInfo.loggedInProviderType).toEqual(loggedInProviderType);
    expect(authInfo.userProfile).toEqual(userProfile);
  });
});
