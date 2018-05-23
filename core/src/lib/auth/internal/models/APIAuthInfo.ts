import AuthInfo from "../AuthInfo";

enum Fields {
  USER_ID = "user_id",
  DEVICE_ID = "device_id",
  ACCESS_TOKEN = "access_token",
  REFRESH_TOKEN = "refresh_token"
}

/**
 * A class containing the fields returned by the Stitch client API in an authentication request.
 */
export default class APIAuthInfo extends AuthInfo {
  public static readFromAPI(bodyText: string): AuthInfo {
    const body = JSON.parse(bodyText)
    return new APIAuthInfo(
      body[Fields.USER_ID],
      body[Fields.DEVICE_ID],
      body[Fields.ACCESS_TOKEN],
      body[Fields.REFRESH_TOKEN]
    );
  }

  protected constructor(
    userId: string,
    deviceId: string,
    accessToken: string,
    refreshToken: string
  ) {
    super(userId, deviceId, accessToken, refreshToken);
  }
}
