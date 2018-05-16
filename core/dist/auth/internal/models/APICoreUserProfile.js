"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const StitchUserProfileImpl_1 = require("../StitchUserProfileImpl");
const APIStitchUserIdentity_1 = require("./APIStitchUserIdentity");
var Fields;
(function (Fields) {
    Fields["DATA"] = "data";
    Fields["USER_TYPE"] = "type";
    Fields["IDENTITIES"] = "identities";
})(Fields || (Fields = {}));
class APICoreUserProfile extends StitchUserProfileImpl_1.default {
    static decodeFrom(body) {
        return new APICoreUserProfile(body[Fields.USER_TYPE], body[Fields.DATA], body[Fields.IDENTITIES].map(APIStitchUserIdentity_1.default.decodeFrom));
    }
    constructor(userType, data, identities) {
        super(userType, data, identities);
    }
}
exports.default = APICoreUserProfile;
//# sourceMappingURL=APICoreUserProfile.js.map