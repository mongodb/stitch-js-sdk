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

import StitchUserIdentity from "../StitchUserIdentity";
import IStitchUserProfile from "../StitchUserProfile";

const NAME = "name";
const EMAIL = "email";
const PICTURE_Url = "picture";
const FIRST_NAME = "first_name";
const LAST_NAME = "last_name";
const GENDER = "gender";
const BIRTHDAY = "birthday";
const MIN_AGE = "min_age";
const MAX_AGE = "max_age";

/**
 * @hidden
 * A class containing the fields returned by the Stitch client API in a user profile request.
 */
export default class StitchUserProfileImpl implements IStitchUserProfile {
  public static empty(): StitchUserProfileImpl {
    return new StitchUserProfileImpl();
  }
  /**
   * A string describing the type of this user. (Either `server` or `normal`)
   */
  public readonly userType?: string;
  /**
   * An object containing extra metadata about the user as supplied by the authentication provider.
   */
  public readonly data: { [key: string]: string };
  /**
   * An array of `StitchUserIdentity` objects representing the identities linked
   * to this user which can be used to log in as this user.
   */
  public readonly identities: StitchUserIdentity[];

  public constructor(
    userType?: string,
    data: { [key: string]: string } = {},
    identities: StitchUserIdentity[] = []
  ) {
    this.userType = userType;
    this.data = data;
    this.identities = identities;
  }

  /**
   * The full name of the user.
   */
  get name(): string | undefined {
    return this.data[NAME];
  }

  /**
   * The email address of the user.
   */
  get email(): string | undefined {
    return this.data[EMAIL];
  }

  /**
   * A Url to the user's profile picture.
   */
  get pictureUrl(): string | undefined {
    return this.data[PICTURE_Url];
  }

  /**
   * The first name of the user.
   */
  get firstName(): string | undefined {
    return this.data[FIRST_NAME];
  }

  /**
   * The last name of the user.
   */
  get lastName(): string | undefined {
    return this.data[LAST_NAME];
  }

  /**
   * The gender of the user.
   */
  get gender(): string | undefined {
    return this.data[GENDER];
  }

  /**
   * The birthdate of the user.
   */
  get birthday(): string | undefined {
    return this.data[BIRTHDAY];
  }

  /**
   * The minimum age of the user.
   */
  get minAge(): string | undefined {
    const age = this.data[MIN_AGE];
    if (age === undefined) {
      return undefined;
    }
    return age;
  }

  /**
   * The maximum age of the user.
   */
  get maxAge(): string | undefined {
    const age = this.data[MAX_AGE];
    if (age === undefined) {
      return undefined;
    }
    return age;
  }
}
