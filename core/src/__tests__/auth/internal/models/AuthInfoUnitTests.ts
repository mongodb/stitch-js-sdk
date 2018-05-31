import { StitchUserProfileImpl } from "../../../../lib";
import AuthInfo from "../../../../lib/auth/internal/AuthInfo";
import StoreStitchUserIdentity from "../../../../lib/auth/internal/models/StoreStitchUserIdentity";

describe("AuthInfo", () => {
  const userId = "foo";
  const deviceId = "bar";
  const accessToken = "baz";
  const refreshToken = "qux";
  const loggedInProviderName = "quux";
  const loggedInProviderType = "corge";

  const userType = "fred";
  const id = "wibble";
  const providerType = "wobble";

  const identities = [new StoreStitchUserIdentity(id, providerType)];
  const userProfile = new StitchUserProfileImpl(userType, {}, identities);

  it("should contain all fields when constructed", () => {
    const authInfo = new AuthInfo(
      userId,
      deviceId,
      accessToken,
      refreshToken,
      loggedInProviderType,
      loggedInProviderName,
      userProfile
    );

    expect(authInfo.userId).toEqual(userId);
    expect(authInfo.deviceId).toEqual(deviceId);
    expect(authInfo.accessToken).toEqual(accessToken);
    expect(authInfo.refreshToken).toEqual(refreshToken);
    expect(authInfo.loggedInProviderName).toEqual(loggedInProviderName);
    expect(authInfo.loggedInProviderType).toEqual(loggedInProviderType);
    expect(authInfo.userProfile).toEqual(userProfile);
  });

  it("should be empty when empty() is called", () => {
    const authInfo = AuthInfo.empty();

    expect(authInfo.userId).toEqual(undefined);
    expect(authInfo.deviceId).toEqual(undefined);
    expect(authInfo.accessToken).toEqual(undefined);
    expect(authInfo.refreshToken).toEqual(undefined);
    expect(authInfo.loggedInProviderName).toEqual(undefined);
    expect(authInfo.loggedInProviderType).toEqual(undefined);
    expect(authInfo.userProfile).toEqual(undefined);
  });

  it("must have deviceId, but nothing else if logged out", () => {
    const authInfo = new AuthInfo(
      userId,
      deviceId,
      accessToken,
      refreshToken,
      loggedInProviderType,
      loggedInProviderName,
      userProfile
    ).loggedOut();

    expect(authInfo.userId).toEqual(undefined);
    expect(authInfo.deviceId).toEqual(deviceId);
    expect(authInfo.accessToken).toEqual(undefined);
    expect(authInfo.refreshToken).toEqual(undefined);
    expect(authInfo.loggedInProviderName).toEqual(undefined);
    expect(authInfo.loggedInProviderType).toEqual(undefined);
    expect(authInfo.userProfile).toEqual(undefined);
  });
});
