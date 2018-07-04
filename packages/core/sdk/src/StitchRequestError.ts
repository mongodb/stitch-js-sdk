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
import {
  StitchRequestErrorCode,
  requestErrorCodeDescs
} from "./StitchRequestErrorCode";

/**
 * Indicates that an error occurred while a request was being carried out. This could be due to (but
 * is not limited to) an unreachable server, a connection timeout, or an inability to decode the
 * result. An error code is included, which indicates whether the error was a transport error or
 * decoding error. The underlyingError property can be read to see that underlying error that caused
 * a StitchRequestError. In the case of transport errors, these errors are thrown by the
 * underlying Transport of the Stitch client. An error in decoding the result from the server
 * is typically an Error thrown internally by the Stitch SDK.
 */
export default class StitchRequestError extends StitchError {
  /**
   * The {@link StitchRequestErrorCode} indicating the reason for this 
   * exception.
   */
  public readonly errorCode: StitchRequestErrorCode;

  /**
   * The name of the {@link StitchRequestErrorCode} indicating the reason for this 
   * exception.
   */
  public readonly errorCodeName: string;

  /**
   * The underlying Error that caused this request exception.
   */
  public readonly underlyingError: Error;

  /**
   * Constructs a request exception from the underlying exception and error code.
   */
  public constructor(
    underlyingError: Error,
    errorCode: StitchRequestErrorCode
  ) {
    const message = `${underlyingError.message}(${
      StitchRequestErrorCode[errorCode]
    }): ${requestErrorCodeDescs[errorCode]}`;
    super(message);
    this.underlyingError = underlyingError;
    this.errorCode = errorCode;
    this.errorCodeName = StitchRequestErrorCode[errorCode];
  }
}
