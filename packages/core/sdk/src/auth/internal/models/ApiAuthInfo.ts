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

import AuthInfo from "../AuthInfo";

enum Fields {
  USER_ID = "user_id",
  DEVICE_ID = "device_id",
  ACCESS_TOKEN = "access_token",
  REFRESH_TOKEN = "refresh_token"
}

/**
 * A class containing the fields returned by the Stitch client API in an authentication request.
 */
export default class ApiAuthInfo extends AuthInfo {
  public static fromJSON(json: object): ApiAuthInfo {
    return new ApiAuthInfo(
      json[Fields.USER_ID],
      json[Fields.DEVICE_ID],
      json[Fields.ACCESS_TOKEN],
      json[Fields.REFRESH_TOKEN]
    );
  }

  public constructor(
    userId: string,
    deviceId: string,
    accessToken: string,
    refreshToken?: string
  ) {
    super(userId, deviceId, accessToken, refreshToken);
  }

  public toJSON(): object {
    return {
      [Fields.USER_ID]: this.userId,
      [Fields.DEVICE_ID]: this.deviceId,
      [Fields.ACCESS_TOKEN]: this.accessToken,
      [Fields.REFRESH_TOKEN]: this.refreshToken
    };
  }
}
