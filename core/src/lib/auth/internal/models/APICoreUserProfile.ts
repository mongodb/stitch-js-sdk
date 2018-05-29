import StitchUserProfileImpl from "../StitchUserProfileImpl";
import APIStitchUserIdentity from "./APIStitchUserIdentity";
import Assertions from "../../../internal/common/Assertions";

enum Fields {
  DATA = "data",
  USER_TYPE = "type",
  IDENTITIES = "identities"
}
/**
 * A class containing the fields returned by the Stitch client API in the
 * `data` field of a user profile request.
 */
export default class APICoreUserProfile extends StitchUserProfileImpl {
  public static decodeFrom(bodyText: string): APICoreUserProfile {
    const body = JSON.parse(bodyText)
    Assertions.keyPresent(Fields.USER_TYPE, body)
    Assertions.keyPresent(Fields.DATA, body)
    Assertions.keyPresent(Fields.IDENTITIES, body)
    return new APICoreUserProfile(
      body[Fields.USER_TYPE],
      body[Fields.DATA],
      body[Fields.IDENTITIES].map(APIStitchUserIdentity.decodeFrom)
    );
  }

  private constructor(
    userType: string,
    data: { [key: string]: any },
    identities: APIStitchUserIdentity[]
  ) {
    super(userType, data, identities);
  }
}
