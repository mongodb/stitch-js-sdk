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

import { Method, StitchAuthRequest } from "mongodb-stitch-core-sdk";
import { deserialize, jsonProperty } from "../JsonMapper";
import { BasicResource } from "../Resources";

/**
 * Class that allows the retrieval of the token
 * and tokenId of a confirmation email, for the sake
 * of skirting email registration
 */
export class ConfirmationEmail {
  @jsonProperty("token")
  public readonly token: string;
  @jsonProperty("token_id")
  public readonly tokenId: string;
}

// Resource for user registrations of an application
export class UserRegistrationsResource extends BasicResource<ConfirmationEmail> {
  public sendConfirmation(email: string): Promise<ConfirmationEmail> {
    const reqBuilder = new StitchAuthRequest.Builder();
    reqBuilder
      .withMethod(Method.POST)
      .withPath(`${this.url}/by_email/${email}/send_confirm`);

    return this.adminAuth
      .doAuthenticatedRequest(reqBuilder.build())
      .then(response =>
        deserialize(JSON.parse(response.body!), ConfirmationEmail)
      );
  }
}