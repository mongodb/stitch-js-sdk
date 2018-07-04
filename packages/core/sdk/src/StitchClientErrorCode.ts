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
 * An enumeration indicating the types of errors that may occur when using a 
 * Stitch client, typically before a request is made to the server.
 */
export enum StitchClientErrorCode {
  LoggedOutDuringRequest,
  MustAuthenticateFirst,
  UserNoLongerValid,
  CouldNotLoadPersistedAuthInfo,
  CouldNotPersistAuthInfo
}

/** @hidden */
export const clientErrorCodeDescs: { [key: number]: string } = {
  [StitchClientErrorCode.LoggedOutDuringRequest]:
    "logged out while making a request to Stitch",
  [StitchClientErrorCode.MustAuthenticateFirst]:
    "method called requires being authenticated",
  [StitchClientErrorCode.UserNoLongerValid]:
    "user instance being accessed is no longer valid; please get a new user with auth.getUser()",
  [StitchClientErrorCode.CouldNotLoadPersistedAuthInfo]:
    "failed to load stored auth information for Stitch",
  [StitchClientErrorCode.CouldNotPersistAuthInfo]:
    "failed to save auth information for Stitch"
};
