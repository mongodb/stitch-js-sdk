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

import { StitchUserProfileImpl } from "../../src";
import StitchUserIdentity from "../../src/auth/StitchUserIdentity";

describe("StitchUserProfile", () => {
  const FIRST_NAME = "FIRST_NAME";
  const LAST_NAME = "LAST_NAME";
  const EMAIL = "EMAIL";
  const GENDER = "GENDER";
  const BIRTHDAY = "BIRTHDAY";
  const PICTURE_URL = "PICTURE_URL";
  const MIN_AGE = "42";
  const MAX_AGE = "84";

  const ANON_USER_DATA = {
    birthday: BIRTHDAY,
    email: EMAIL,
    first_name: FIRST_NAME,
    gender: GENDER,
    last_name: LAST_NAME,
    max_age: MAX_AGE,
    min_age: MIN_AGE,
    picture: PICTURE_URL
  };

  it("should initialize", () => {
    const anonIdentity = new class extends StitchUserIdentity {
      public constructor(id: string, providerType: string) {
        super(id, providerType);
      }
    }("id", "anon-user");

    const stitchUserProfileImpl = new StitchUserProfileImpl(
      "local-userpass",
      ANON_USER_DATA,
      [anonIdentity]
    );

    expect(stitchUserProfileImpl.firstName).toEqual(FIRST_NAME);
    expect(stitchUserProfileImpl.lastName).toEqual(LAST_NAME);
    expect(stitchUserProfileImpl.email).toEqual(EMAIL);
    expect(stitchUserProfileImpl.gender).toEqual(GENDER);
    expect(stitchUserProfileImpl.birthday).toEqual(BIRTHDAY);
    expect(stitchUserProfileImpl.pictureUrl).toEqual(PICTURE_URL);
    expect(stitchUserProfileImpl.minAge).toEqual(Number.parseInt(MIN_AGE));
    expect(stitchUserProfileImpl.maxAge).toEqual(Number.parseInt(MAX_AGE));
    expect(stitchUserProfileImpl.userType).toEqual("local-userpass");
    expect(stitchUserProfileImpl.identities.length).toEqual(1);
    expect(stitchUserProfileImpl.identities[0]).toEqual(anonIdentity);
  });
});
