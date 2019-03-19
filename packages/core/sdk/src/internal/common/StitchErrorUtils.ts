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

import StitchError from "../../StitchError";
import StitchRequestError from "../../StitchRequestError";
import { StitchRequestErrorCode } from "../../StitchRequestErrorCode";
import StitchServiceError from "../../StitchServiceError";
import {
  StitchServiceErrorCode,
  stitchServiceErrorCodeFromApi
} from "../../StitchServiceErrorCode";
import ContentTypes from "../net/ContentTypes";
import Headers from "../net/Headers";
import Response from "../net/Response";

enum Fields {
  ERROR = "error",
  ERROR_CODE = "error_code"
}

/**
 * @hidden
 * Static utility method that accepts an error object, and returns it
 * as is if it's a StitchError, or wraps it in a StitchRequestError
 * decoding error if it's not.
 *
 * @param err The error to check and potentially wrap.
 */
export function wrapDecodingError(err: any): StitchError {
  if (err instanceof StitchError) {
    return err;
  }

  return new StitchRequestError(err, StitchRequestErrorCode.DECODING_ERROR);
}

/**
 * @hidden
 * Static utility method that accepts an HTTP response object, and throws the
 * StitchServiceError representing the the error in the response. If the error cannot be
 * recognized, this will throw a StitchServiceError with the "UNKNOWN" error code.
 *
 * @param response The network response.
 */
export function handleRequestError(response: Response): never {
  if (response.body === undefined) {
    throw new StitchServiceError(
      `received unexpected status code ${response.statusCode}`,
      StitchServiceErrorCode.Unknown
    );
  }

  let body: string;

  try {
    body = response.body as string;
  } catch (e) {
    throw new StitchServiceError(
      `received unexpected status code ${response.statusCode}`,
      StitchServiceErrorCode.Unknown
    );
  }

  const errorMsg: string = handleRichError(response, body);

  // If the above function call didn't throw, throw an unknown error here
  throw new StitchServiceError(errorMsg, StitchServiceErrorCode.Unknown);
}

/**
 * Private helper method which decodes the Stitch error from the body of an HTTP `Response`
 * object. If the error is successfully decoded, this function will throw the error for the end
 * user to eventually consume. If the error cannot be decoded, this is likely not an error from
 * the Stitch server, and this function will return an error message that the calling function
 * should use as the message of a StitchServiceError with an unknown code.
 */
function handleRichError(response: Response, body: string): string {
  if (
    response.headers[Headers.CONTENT_TYPE] === undefined ||
    (response.headers[Headers.CONTENT_TYPE] !== undefined &&
      response.headers[Headers.CONTENT_TYPE] !== ContentTypes.APPLICATION_JSON)
  ) {
    return body;
  }

  const bsonObj = JSON.parse(body);

  if (!(bsonObj instanceof Object)) {
    return body;
  }

  const doc = bsonObj as object;
  if (doc[Fields.ERROR] === undefined) {
    return body;
  }
  const errorMsg = doc[Fields.ERROR] as string;
  if (doc[Fields.ERROR_CODE] === undefined) {
    return errorMsg;
  }

  const errorCode = doc[Fields.ERROR_CODE] as string;

  throw new StitchServiceError(
    errorMsg,
    stitchServiceErrorCodeFromApi(errorCode)
  );
}
