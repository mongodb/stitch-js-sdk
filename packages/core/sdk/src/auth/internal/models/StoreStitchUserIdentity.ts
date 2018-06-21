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

import StitchUserIdentity from "../../StitchUserIdentity";

enum Fields {
  ID = "id",
  PROVIDER_TYPE = "provider_type"
}

/**
 * A class describing the structure of how user identity information is stored in persisted `Storage`.
 */
export default class StoreStitchUserIdentity extends StitchUserIdentity {
  public static decode(from: object): StoreStitchUserIdentity {
    return new StoreStitchUserIdentity(
      from[Fields.ID],
      from[Fields.PROVIDER_TYPE]
    )
  }

  /**
   * The id of this identity in MongoDB Stitch
   *
   * - important: This is **not** the id of the Stitch user.
   */
  public id: string;
  /**
   * A string indicating the authentication provider that provides this identity.
   */
  public providerType: string;

  public constructor(id: string, providerType: string) {
    super(id, providerType);
  }

  public encode(): object {
    return {
      [Fields.ID]: this.id,
      [Fields.PROVIDER_TYPE]: this.providerType
    }
  }
}
