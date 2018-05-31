import { mock, when, instance, verify } from "ts-mockito/lib/ts-mockito";
import { CoreStitchAuth, CoreStitchUser } from "../../../lib";
import { sign } from "jsonwebtoken";
import AccessTokenRefresher from "../../../lib/auth/internal/AccessTokenRefresher";
import AuthInfo from "../../../lib/auth/internal/AuthInfo";

describe("AccessTokenRefresherUnitTests", () => {
  it("should check refresh", () => {
    const authMock = <CoreStitchAuth<CoreStitchUser>>mock(CoreStitchAuth);
    const auth = instance(authMock);

    const accessTokenRefresher = new AccessTokenRefresher<CoreStitchUser>(auth);

    // Auth starts out logged in and with a fresh token
    const freshJwt = sign(
      {
        iat: new Date().getMilliseconds(),
        sub: "uniqueUserID",
        exp: new Date().getMilliseconds() + 20 * 60 * 1000
      },
      "abcdefghijklmnopqrstuvwxyz1234567890"
    );

    const freshAuthInfo = new AuthInfo(
      "",
      "",
      freshJwt,
      freshJwt,
      "",
      "",
      undefined
    );

    when(authMock.isLoggedIn).thenReturn(true);
    when(authMock.authInfo).thenReturn(freshAuthInfo);

    verify(authMock.refreshAccessToken()).times(0);
    verify(authMock.authInfo).times(0);

    expect(accessTokenRefresher.shouldRefresh()).toBeTruthy();

    verify(authMock.refreshAccessToken()).times(0);
    verify(authMock.authInfo).times(1);

    // Auth info is now expired
    const expiredJwt = sign(
      {
        iat: new Date().getMilliseconds() - 10 * 60 * 1000,
        sub: "uniqueUserID",
        exp: new Date().getMilliseconds() - 5 * 60 * 1000
      },
      "abcdefghijklmnopqrstuvwxyz1234567890"
    );

    const expiredAuthInfo = new AuthInfo(
      "",
      "",
      expiredJwt,
      expiredJwt,
      "",
      "",
      undefined
    );

    when(authMock.authInfo).thenReturn(expiredAuthInfo);

    expect(accessTokenRefresher.shouldRefresh()).toBeTruthy();

    // CoreStitchAuth is GCd
    const accessTokenRefresher2 = new AccessTokenRefresher<CoreStitchUser>(
      undefined
    );
    expect(accessTokenRefresher2.shouldRefresh()).toBeFalsy();
  });
});
