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
import StitchUserProfile from "../StitchUserProfile";

/**
 * @hidden
 * The set of properties that describe an authenticated Stitch user.
 */
export default interface CoreStitchUser {
  /**
   * The id of the Stitch user.
   */
  readonly id: string;
  /**
   * The type of authentication provider used to log in as this user.
   */
  readonly loggedInProviderType: string;
  /**
   * The name of the authentication provider used to log in as this user.
   */
  readonly loggedInProviderName: string;
  /**
   * A string describing the type of this user. (Either `server` or `normal`)
   */
  readonly userType?: string;
  /**
   * A `StitchUserProfile` object describing this user.
   */
  readonly profile: StitchUserProfile;
  /**
   * An array of `StitchUserIdentity` objects representing the identities linked
   * to this user which can be used to log in as this user.
   */
  readonly identities: StitchUserIdentity[];

  /**
   * Whether or not this user is logged in. If the user is logged in, it can be
   * switched to without reauthenticating.
   */
  readonly isLoggedIn: boolean;
}
