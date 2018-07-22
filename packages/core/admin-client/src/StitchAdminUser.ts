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

import {
  CoreStitchUser,
  Method,
  StitchAuthRequest,
  StitchUserFactory,
  StitchUserIdentity,
  StitchUserProfile,
  StitchUserProfileImpl
} from "mongodb-stitch-core-sdk";
import { StitchAdminUserProfile } from "./StitchAdminUserProfile";

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

  /* TODO: Solve this
  // public adminProfile(): Promise<StitchAdminUserProfile> {
  //   const req = new StitchAuthRequest.Builder()
  //     .withMethod(Method.GET)
  //     .withPath(this.authRoutes.profileRoute)
  //     .build();

  //   return this.adminAuth.doAuthenticatedRequestWithDecoder(
  //     req,
  //     new StitchAdminUserProfileCodec()
  //   );
  // }*/
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
