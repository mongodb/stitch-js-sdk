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

import { Codec, CoreStitchUser, StitchCredential } from "mongodb-stitch-core-sdk";
import { StitchAuthImpl } from "./internal/StitchAuthImpl";
import StitchUserImpl from "./internal/StitchUserImpl";
import StitchRedirectCredential from "./providers/StitchRedirectCredential";

enum Fields {
  UserId = "user_id",
  LoggedInProviderType = "logged_in_provider_type",
  LoggedInProviderName = "logged_in_provider_name",
  UserProfile = "user_profile"
}

export class StitchUserCodec implements Codec<StitchUser> {
  constructor(
    private readonly auth: StitchAuthImpl
  ) {}

  public decode(from: object): StitchUser {
    return new StitchUserImpl(
      from[Fields.UserId],
      from[Fields.LoggedInProviderType],
      from[Fields.LoggedInProviderName],
      from[Fields.UserProfile],
      this.auth
    );
  }

  public encode(from: StitchUser): object {
    return {
      [Fields.UserId]: from.id,
      [Fields.LoggedInProviderType]: from.loggedInProviderType,
      [Fields.LoggedInProviderName]: from.loggedInProviderName,
      [Fields.UserProfile]: from.profile
    };
  }
}

interface StitchUser extends CoreStitchUser {
  linkUserWithRedirect(credential: StitchRedirectCredential): Promise<void>;
  linkWithCredential(credential: StitchCredential): Promise<StitchUser>;
}

export default StitchUser;
