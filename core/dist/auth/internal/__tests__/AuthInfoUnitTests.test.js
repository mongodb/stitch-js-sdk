"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const AuthInfo_1 = require("../AuthInfo");
const StoreStitchUserIdentity_1 = require("../models/StoreStitchUserIdentity");
const StitchUserProfileImpl_1 = require("../StitchUserProfileImpl");
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
    const identities = [new StoreStitchUserIdentity_1.default(id, providerType)];
    const userProfile = new StitchUserProfileImpl_1.default(userType, {}, identities);
    it("should contain all fields when constructed", () => {
        const authInfo = new AuthInfo_1.default(userId, deviceId, accessToken, refreshToken, loggedInProviderType, loggedInProviderName, userProfile);
        expect(authInfo.userId).toEqual(userId);
        expect(authInfo.deviceId).toEqual(deviceId);
        expect(authInfo.accessToken).toEqual(accessToken);
        expect(authInfo.refreshToken).toEqual(refreshToken);
        expect(authInfo.loggedInProviderName).toEqual(loggedInProviderName);
        expect(authInfo.loggedInProviderType).toEqual(loggedInProviderType);
        expect(authInfo.userProfile).toEqual(userProfile);
    });
    it("should be empty when empty() is called", () => {
        const authInfo = AuthInfo_1.default.empty();
        expect(authInfo.userId).toEqual(undefined);
        expect(authInfo.deviceId).toEqual(undefined);
        expect(authInfo.accessToken).toEqual(undefined);
        expect(authInfo.refreshToken).toEqual(undefined);
        expect(authInfo.loggedInProviderName).toEqual(undefined);
        expect(authInfo.loggedInProviderType).toEqual(undefined);
        expect(authInfo.userProfile).toEqual(undefined);
    });
    it("must have deviceId, but nothing else if logged out", () => {
        const authInfo = new AuthInfo_1.default(userId, deviceId, accessToken, refreshToken, loggedInProviderType, loggedInProviderName, userProfile).loggedOut();
        expect(authInfo.userId).toEqual(undefined);
        expect(authInfo.deviceId).toEqual(deviceId);
        expect(authInfo.accessToken).toEqual(undefined);
        expect(authInfo.refreshToken).toEqual(undefined);
        expect(authInfo.loggedInProviderName).toEqual(undefined);
        expect(authInfo.loggedInProviderType).toEqual(undefined);
        expect(authInfo.userProfile).toEqual(undefined);
    });
});
//# sourceMappingURL=AuthInfoUnitTests.test.js.map