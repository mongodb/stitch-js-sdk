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
 * The set of properties that describe a MongoDB Stitch user.
 */
export default interface StitchUserProfile {
  /**
   * The full name of the user.
   */
  readonly name?: string;

  /**
   * The email address of the user.
   */
  readonly email?: string;

  /**
   * A Url to the user's profile picture.
   */
  readonly pictureUrl?: string;

  /**
   * The first name of the user.
   */
  readonly firstName?: string;

  /**
   * The last name of the user.
   */
  readonly lastName?: string;

  /**
   * The gender of the user.
   */
  readonly gender?: string;

  /**
   * The birthdate of the user.
   */
  readonly birthday?: string;

  /**
   * The minimum age of the user.
   */
  readonly minAge?: number;

  /**
   * The maximum age of the user.
   */
  readonly maxAge?: number;
}
