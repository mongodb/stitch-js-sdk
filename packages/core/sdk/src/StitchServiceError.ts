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

import StitchError from "./StitchError";
import { StitchServiceErrorCode } from "./StitchServiceErrorCode";

/**
 * A StitchServiceError is an exception indicating that an error came from the Stitch server
 * after a request was completed, with an error message and an error code defined in the
 * `StitchServiceErrorCode` enum.
 *
 * It is possible that the error code will be `UNKNOWN`, which can mean one of several
 * possibilities: the Stitch server returned a message that this version of the SDK does not yet
 * recognize, the server is not a Stitch server and returned an unexpected message, or the response
 * was corrupted. In these cases, the associated message will be the plain text body of the
 * response, or an empty string if the body is empty or not decodable as plain text.
 */
export default class StitchServiceError extends StitchError {
  /**
   * The StitchServiceErrorCode indicating the reason for this exception.
   */
  public readonly errorCode: StitchServiceErrorCode;

  /**
   * A string describing the reason for the error.
   */
  public readonly message: string;

  public constructor(
    message: string,
    errorCode: StitchServiceErrorCode = StitchServiceErrorCode.Unknown
  ) {
    super(message);
    this.message = message;
    this.errorCode = errorCode;
  }
}
