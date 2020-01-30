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

import CoreStitchUser from "./CoreStitchUser";
import StitchUserProfileImpl from "./StitchUserProfileImpl";

/**
 * @hidden
 * An interface describing a factory that produces a generic Stitch user object conforming to `CoreStitchUser`.
 */
interface StitchUserFactory<T extends CoreStitchUser> {
  /**
   * The factory function which will produce the user with the provided id, 
   * logged in provider type/name, logged in status, last auth activity 
   * timestamp, and a user profile.
   */
  makeUser(
    id: string,
    loggedInProviderType: string,
    loggedInProviderName: string,
    isLoggedIn: boolean,
    lastAuthActivity: Date,
    userProfile?: StitchUserProfileImpl,
    customData?: { [key: string]: any }
  ): T;
}

export default StitchUserFactory;
