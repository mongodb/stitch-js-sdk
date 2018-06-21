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

import StitchUserIdentity from "../StitchUserIdentity";
import CoreStitchUser from "./CoreStitchUser";
import StitchUserProfileImpl from "./StitchUserProfileImpl";

/**
 * @hidden
 * The set of properties that describe an authenticated Stitch user.
 */
export default class CoreStitchUserImpl implements CoreStitchUser {
  /**
   * The id of the Stitch user.
   */
  public readonly id: string;
  /**
   * The type of authentication provider used to log in as this user.
   */
  public readonly loggedInProviderType: string;
  /**
   * The name of the authentication provider used to log in as this user.
   */
  public readonly loggedInProviderName: string;
  /**
   * A `StitchUserProfile` object describing this user.
   */
  public readonly profile: StitchUserProfileImpl;

  protected constructor(
    id: string,
    loggedInProviderType: string,
    loggedInProviderName: string,
    profile?: StitchUserProfileImpl
  ) {
    this.id = id;
    this.loggedInProviderType = loggedInProviderType;
    this.loggedInProviderName = loggedInProviderName;
    this.profile =
      profile === undefined ? StitchUserProfileImpl.empty() : profile;
  }

  /**
   * A string describing the type of this user. (Either `server` or `normal`)
   */
  public get userType(): string | undefined {
    return this.profile.userType;
  }

  /**
   * An array of `StitchUserIdentity` objects representing the identities linked
   * to this user which can be used to log in as this user.
   */
  public get identities(): StitchUserIdentity[] {
    return this.profile.identities;
  }
}
