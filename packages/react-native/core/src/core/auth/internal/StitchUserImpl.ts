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
  CoreStitchUserImpl,
  StitchCredential,
  StitchUserProfileImpl
} from "mongodb-stitch-core-sdk";
import StitchUser from "../StitchUser";
import StitchAuthImpl from "./StitchAuthImpl";

/** @hidden */
export default class StitchUserImpl extends CoreStitchUserImpl
  implements StitchUser {
  public constructor(
    id: string,
    loggedInProviderType: string,
    loggedInProviderName: string,
    isLoggedIn: boolean,
    profile: StitchUserProfileImpl,
    private readonly auth: StitchAuthImpl
  ) {
    super(id, loggedInProviderType, loggedInProviderName, isLoggedIn, profile);
  }

  public linkWithCredential(credential: StitchCredential): Promise<StitchUser> {
    return this.auth.linkWithCredential(this, credential);
  }
}
