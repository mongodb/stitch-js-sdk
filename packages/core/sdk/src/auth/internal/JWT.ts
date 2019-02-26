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

import { base64Decode } from "../../internal/common/Base64";
import StitchClientError from "../../StitchClientError";

const EXPIRES = "exp";
const ISSUED_AT = "iat";

/**
 * @hidden
 * A simple class representing a JWT issued by the Stitch server. Only contains claims relevant to the SDK.
 */
export default class JWT {
  /**
   * Initializes the `StitchJWT` with a base64-encoded string, with or without padding characters.
   */
  public static fromEncoded(encodedJWT: string): JWT {
    const parts = JWT.splitToken(encodedJWT);
    const json = JSON.parse(base64Decode(parts[1]));
    const expires = json[EXPIRES];
    const iat = json[ISSUED_AT];
    return new JWT(expires, iat);
  }

  /**
   * Private utility function to split the JWT into its three constituent parts.
   */
  private static splitToken(jwt: string): string[] {
    const parts = jwt.split(".");
    if (parts.length !== 3) {
      throw new Error(
        `Malformed JWT token. The string ${jwt} should have 3 parts.`
      );
    }
    return parts;
  }

  /**
   * Per RFC 7519:
   * 4.1.4.  "exp" (Expiration Time) Claim
   *
   * The "exp" (expiration time) claim identifies the expiration time on
   * or after which the JWT MUST NOT be accepted for processing.  The
   * processing of the "exp" claim requires that the current date/time
   * MUST be before the expiration date/time listed in the "exp" claim.
   */
  public readonly expires: number;
  /**
   * Per RFC 7519:
   * 4.1.6.  "iat" (Issued At) Claim
   *
   * The "iat" (issued at) claim identifies the time at which the JWT was
   * issued.  This claim can be used to determine the age of the JWT.  Its
   * value MUST be a number containing a NumericDate value.  Use of this
   * claim is OPTIONAL.
   */
  public readonly issuedAt: number;

  private constructor(expires: number, issuedAt: number) {
    this.expires = expires;
    this.issuedAt = issuedAt;
  }
}
