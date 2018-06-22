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

/**
 * An enumeration indicating the types of errors that may occur when carrying 
 * out a Stitch request.
 */
export enum StitchRequestErrorCode {
  TRANSPORT_ERROR,
  DECODING_ERROR,
  ENCODING_ERROR
}

/** @hidden */
export const requestErrorCodeDescs: {
  [id in StitchRequestErrorCode]: string
} = {
  [StitchRequestErrorCode.TRANSPORT_ERROR]:
    "the request transport encountered an error communicating with Stitch",
  [StitchRequestErrorCode.DECODING_ERROR]:
    "an error occurred while decoding a response from Stitch",
  [StitchRequestErrorCode.ENCODING_ERROR]:
    "an error occurred while encoding a request for Stitch"
};
