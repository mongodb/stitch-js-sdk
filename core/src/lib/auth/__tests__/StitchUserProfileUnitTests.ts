import StitchUserProfileImpl from "../internal/StitchUserProfileImpl";
import StitchUserIdentity from "../StitchUserIdentity";

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
    expect(stitchUserProfileImpl.pictureURL).toEqual(PICTURE_URL);
    expect(stitchUserProfileImpl.minAge).toEqual(Number.parseInt(MIN_AGE));
    expect(stitchUserProfileImpl.maxAge).toEqual(Number.parseInt(MAX_AGE));
    expect(stitchUserProfileImpl.userType).toEqual("local-userpass");
    expect(stitchUserProfileImpl.identities.length).toEqual(1);
    expect(stitchUserProfileImpl.identities[0]).toEqual(anonIdentity);
  });
});
