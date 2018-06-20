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

import StitchUserProfileImpl from "../StitchUserProfileImpl";
import StoreStitchUserIdentity from "./StoreStitchUserIdentity";

enum Fields {
  DATA = "data",
  USER_TYPE = "user_type",
  IDENTITIES = "identities"
}

/**
 * A class describing the structure of how user profile information is stored in persisted `Storage`.
 */
export default class StoreCoreUserProfile extends StitchUserProfileImpl {
  /**
   * A string describing the type of this user. (Either `server` or `normal`)
   */
  public userType: string;
  /**
   * An object containing extra metadata about the user as supplied by the authentication provider.
   */
  public data: { [key: string]: string };
  /**
   * An array of `StitchUserIdentity` objects representing the identities linked
   * to this user which can be used to log in as this user.
   */
  public identities: StoreStitchUserIdentity[];
}
