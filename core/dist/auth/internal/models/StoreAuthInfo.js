"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const AuthInfo_1 = require("../AuthInfo");
var Fields;
(function (Fields) {
    Fields["USER_ID"] = "user_id";
    Fields["DEVICE_ID"] = "device_id";
    Fields["ACCESS_TOKEN"] = "access_token";
    Fields["REFRESH_TOKEN"] = "refresh_token";
    Fields["LOGGED_IN_PROVIDER_TYPE"] = "logged_in_provider_type";
    Fields["LOGGED_IN_PROVIDER_NAME"] = "logged_in_provider_name";
    Fields["USER_PROFILE"] = "user_profile";
})(Fields || (Fields = {}));
function readFromStorage(storage) {
    const rawInfo = storage.get(StoreAuthInfo.STORAGE_NAME);
    if (rawInfo === undefined) {
        return undefined;
    }
    return StoreAuthInfo.decode(JSON.parse(rawInfo));
}
exports.readFromStorage = readFromStorage;
function writeToStorage(authInfo, storage) {
    const info = new StoreAuthInfo(authInfo.userId, authInfo.deviceId, authInfo.accessToken, authInfo.refreshToken, authInfo.loggedInProviderType, authInfo.loggedInProviderName, authInfo.userProfile);
    storage.set(StoreAuthInfo.STORAGE_NAME, JSON.stringify(info.encode()));
}
exports.writeToStorage = writeToStorage;
class StoreAuthInfo extends AuthInfo_1.default {
    constructor(userId, deviceId, accessToken, refreshToken, loggedInProviderType, loggedInProviderName, userProfile) {
        super(userId, deviceId, accessToken, refreshToken, loggedInProviderType, loggedInProviderName, userProfile);
    }
    static decode(from) {
        const userId = from[Fields.USER_ID];
        const deviceId = from[Fields.DEVICE_ID];
        const accessToken = from[Fields.ACCESS_TOKEN];
        const refreshToken = from[Fields.REFRESH_TOKEN];
        const loggedInProviderType = from[Fields.LOGGED_IN_PROVIDER_TYPE];
        const loggedInProviderName = from[Fields.LOGGED_IN_PROVIDER_NAME];
        const userProfile = from[Fields.USER_PROFILE];
        return new StoreAuthInfo(userId, deviceId, accessToken, refreshToken, loggedInProviderType, loggedInProviderName, userProfile);
    }
    encode() {
        const to = {};
        to[Fields.USER_ID] = this.userId;
        to[Fields.ACCESS_TOKEN] = this.accessToken;
        to[Fields.REFRESH_TOKEN] = this.refreshToken;
        to[Fields.DEVICE_ID] = this.deviceId;
        to[Fields.LOGGED_IN_PROVIDER_NAME] = this.loggedInProviderName;
        to[Fields.LOGGED_IN_PROVIDER_TYPE] = this.loggedInProviderType;
        to[Fields.USER_PROFILE] = this.userProfile;
        return to;
    }
}
StoreAuthInfo.STORAGE_NAME = "auth_info";
exports.StoreAuthInfo = StoreAuthInfo;
//# sourceMappingURL=StoreAuthInfo.js.map