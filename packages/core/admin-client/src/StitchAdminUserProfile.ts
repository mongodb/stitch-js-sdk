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

import { ApiStitchUserIdentity, Codec, Decoder } from "mongodb-stitch-core-sdk";

enum StitchAdminUserProfileFields {
  UserType = "type",
  Identities = "identities",
  Data = "data",
  Roles = "roles"
}

/**
 * A struct containing the fields returned by the Stitch client API in a user profile request.
 */
export interface StitchAdminUserProfile {
  /**
   * A string describing the type of this user.
   */
  readonly userType: string;

  /**
   * An array of `StitchUserIdentity` objects representing the identities linked
   * to this user which can be used to log in as this user.
   */
  readonly identities: ApiStitchUserIdentity[];

  /**
   * An object containing extra metadata about the user as supplied by the authentication provider.
   */
  readonly data: object;

  /**
   * A list of the roles that this admin user has.
   */
  readonly roles: StitchAdminRole[];
}

export class StitchAdminUserProfileCodec
  implements Decoder<StitchAdminUserProfile> {
  public decode(from: object): StitchAdminUserProfile {
    const roleCodec = new StitchAdminRoleCodec();

    return {
      data: from[StitchAdminUserProfileFields.Data],
      identities: from[StitchAdminUserProfileFields.Identities].map(identity =>
        ApiStitchUserIdentity.fromJSON(identity)
      ),
      roles: from[StitchAdminUserProfileFields.Roles].map(role =>
        roleCodec.decode(role)
      ),
      userType: from[StitchAdminUserProfileFields.UserType]
    };
  }
}

enum StitchAdminRoleFields {
  Name = "role_name",
  GroupId = "group_id"
}

export interface StitchAdminRole {
  readonly name: string;
  readonly groupId: string;
}

export class StitchAdminRoleCodec implements Decoder<StitchAdminRole> {
  public decode(from: object): StitchAdminRole {
    return {
      groupId: from[StitchAdminRoleFields.GroupId],
      name: from[StitchAdminRoleFields.Name]
    };
  }
}
