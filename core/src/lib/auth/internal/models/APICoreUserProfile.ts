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
  public static fromJSON(json: object) {
    Assertions.keyPresent(Fields.USER_TYPE, json);
    Assertions.keyPresent(Fields.DATA, json);
    Assertions.keyPresent(Fields.IDENTITIES, json);
    return new APICoreUserProfile(
      json[Fields.USER_TYPE],
      json[Fields.DATA],
      json[Fields.IDENTITIES].map(APIStitchUserIdentity.fromJSON)
    );
  }

  public constructor(
    userType: string,
    data: { [key: string]: any },
    identities: APIStitchUserIdentity[]
  ) {
    super(userType, data, identities);
  }

  public toJSON(): object {
    return {
      [Fields.DATA]: this.data,
      [Fields.USER_TYPE]: this.userType,
      [Fields.IDENTITIES]: this.identities
    };
  }
}
