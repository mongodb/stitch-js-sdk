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

import Assertions from "../../../internal/common/Assertions";
import StitchUserProfileImpl from "../StitchUserProfileImpl";
import ApiStitchUserIdentity from "./ApiStitchUserIdentity";

enum Fields {
  DATA = "data",
  USER_TYPE = "type",
  IDENTITIES = "identities"
}

/**
 * A class containing the fields returned by the Stitch client API in the
 * `data` field of a user profile request.
 */
export default class ApiCoreUserProfile extends StitchUserProfileImpl {
  public static fromJSON(json: object) {
    Assertions.keyPresent(Fields.USER_TYPE, json);
    Assertions.keyPresent(Fields.DATA, json);
    Assertions.keyPresent(Fields.IDENTITIES, json);
    return new ApiCoreUserProfile(
      json[Fields.USER_TYPE],
      json[Fields.DATA],
      json[Fields.IDENTITIES].map(ApiStitchUserIdentity.fromJSON)
    );
  }

  public constructor(
    userType: string,
    data: { [key: string]: any },
    identities: ApiStitchUserIdentity[]
  ) {
    super(userType, data, identities);
  }

  public toJSON(): object {
    return {
      [Fields.DATA]: this.data,
      [Fields.USER_TYPE]: this.userType,
      [Fields.IDENTITIES]: this.identities
    };
  }
}
