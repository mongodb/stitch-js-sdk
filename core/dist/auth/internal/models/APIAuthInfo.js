"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const AuthInfo_1 = require("../AuthInfo");
var Fields;
(function (Fields) {
    Fields["USER_ID"] = "user_id";
    Fields["DEVICE_ID"] = "device_id";
    Fields["ACCESS_TOKEN"] = "access_token";
    Fields["REFRESH_TOKEN"] = "refresh_token";
})(Fields || (Fields = {}));
class APIAuthInfo extends AuthInfo_1.default {
    static readFromAPI(body) {
        return new APIAuthInfo(body[Fields.USER_ID], body[Fields.DEVICE_ID], body[Fields.ACCESS_TOKEN], body[Fields.REFRESH_TOKEN]);
    }
    constructor(userId, deviceId, accessToken, refreshToken) {
        super(userId, deviceId, accessToken, refreshToken);
    }
}
exports.default = APIAuthInfo;
//# sourceMappingURL=APIAuthInfo.js.map