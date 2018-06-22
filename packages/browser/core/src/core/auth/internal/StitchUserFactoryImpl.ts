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
  StitchUserFactory,
  StitchUserProfileImpl
} from "mongodb-stitch-core-sdk";
import StitchUser from "../StitchUser";
import StitchAuthImpl from "./StitchAuthImpl";
import StitchUserImpl from "./StitchUserImpl";

/** @hidden */
export default class StitchUserFactoryImpl
  implements StitchUserFactory<StitchUser> {
  private readonly auth: StitchAuthImpl;

  public constructor(auth: StitchAuthImpl) {
    this.auth = auth;
  }

  public makeUser(
    id: string,
    loggedInProviderType: string,
    loggedInProviderName: string,
    userProfile: StitchUserProfileImpl
  ): StitchUser {
    return new StitchUserImpl(
      id,
      loggedInProviderType,
      loggedInProviderName,
      userProfile,
      this.auth
    );
  }
}
