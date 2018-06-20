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

import { Decoder } from "../../internal/common/Codec";
import Response from "../../internal/net/Response";
import { StitchAuthRequest } from "../../internal/net/StitchAuthRequest";

/**
 * An interface defining the methods necessary to make authenticated requests to the Stitch server.
 */
export default interface StitchAuthRequestClient {
  /**
   * Performs an authenticated request to the Stitch server, using the current authentication state, and should
   * throw when not currently authenticated.
   *
   * - returns: The response to the request as a `Response`.
   */
  doAuthenticatedRequest(stitchReq: StitchAuthRequest): Promise<Response>;

  /**
   * Performs an authenticated request to the Stitch server with a JSON request body, using the current
   * authentication state, and should throw when not currently authenticated.
   *
   * - returns: An `Any` representing the response body as decoded JSON.
   */
  doAuthenticatedRequestWithDecoder<T>(
    stitchReq: StitchAuthRequest,
    decoder?: Decoder<T>
  ): Promise<T>;
}
