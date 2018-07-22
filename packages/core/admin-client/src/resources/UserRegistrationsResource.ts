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

import { Codec, Method, StitchAuthRequest } from "../../../../sdk/dist/esm";
import { BasicResource } from "../../Resources";
import UserRegistrationRoutes from "../routes/UserRegistrationsRoutes";

enum Fields {
  Token = "token",
  TokenId = "token_id"
}

/**
 * Class that allows the retrieval of the token
 * and tokenId of a confirmation email, for the sake
 * of skirting email registration
 */
export interface ConfirmationEmail {
  readonly token: string;
  readonly tokenId: string;
}

export class ConfirmationEmailCodec implements Codec<ConfirmationEmail> {
  public decode(from: any): ConfirmationEmail {
    return {
      token: from[Fields.Token],
      tokenId: from[Fields.TokenId]
    };
  }

  public encode(from: ConfirmationEmail): object {
    return {
      [Fields.Token]: from.token,
      [Fields.TokenId]: from.tokenId
    };
  }
}


// / Resource for user registrations of an application
export class UserRegistrationsResource extends BasicResource<UserRegistrationRoutes> {
  public sendConfirmation(email: string): Promise<ConfirmationEmail> {
    const reqBuilder = new StitchAuthRequest.Builder();
    reqBuilder
      .withMethod(Method.POST)
      .withPath(this.routes.getSendConfirmationRoute(email));

    return this.authRequestClient
      .doAuthenticatedRequest(reqBuilder.build())
      .then(response =>
        new ConfirmationEmailCodec().decode(JSON.parse(response.body!))
      );
  }
}
