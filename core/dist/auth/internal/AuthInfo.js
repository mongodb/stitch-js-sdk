"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class AuthInfo {
    static empty() {
        return new AuthInfo(undefined, undefined, undefined, undefined, undefined, undefined, undefined);
    }
    constructor(userId, deviceId, accessToken, refreshToken, loggedInProviderType, loggedInProviderName, userProfile) {
        this.userId = userId;
        this.deviceId = deviceId;
        this.accessToken = accessToken;
        this.refreshToken = refreshToken;
        this.loggedInProviderType = loggedInProviderType;
        this.loggedInProviderName = loggedInProviderName;
        this.userProfile = userProfile;
    }
    loggedOut() {
        return new AuthInfo(undefined, this.deviceId, undefined, undefined, undefined, undefined, undefined);
    }
    merge(newInfo) {
        return new AuthInfo(newInfo.userId === undefined ? this.userId : newInfo.userId, newInfo.deviceId === undefined ? this.deviceId : newInfo.deviceId, newInfo.accessToken === undefined
            ? this.accessToken
            : newInfo.accessToken, newInfo.refreshToken === undefined
            ? this.refreshToken
            : newInfo.refreshToken, newInfo.loggedInProviderType === undefined
            ? this.loggedInProviderType
            : newInfo.loggedInProviderType, newInfo.loggedInProviderName === undefined
            ? this.loggedInProviderName
            : newInfo.loggedInProviderName, newInfo.userProfile === undefined ? this.userProfile : newInfo.userProfile);
    }
}
exports.default = AuthInfo;
//# sourceMappingURL=AuthInfo.js.map