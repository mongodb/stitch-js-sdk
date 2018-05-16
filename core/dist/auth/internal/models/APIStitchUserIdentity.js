"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const StitchUserIdentity_1 = require("../../StitchUserIdentity");
var Fields;
(function (Fields) {
    Fields["ID"] = "id";
    Fields["PROVIDER_TYPE"] = "provider_type";
})(Fields || (Fields = {}));
class APIStitchUserIdentity extends StitchUserIdentity_1.default {
    static decodeFrom(body) {
        return new APIStitchUserIdentity(body[Fields.ID], body[Fields.PROVIDER_TYPE]);
    }
    constructor(id, providerType) {
        super(id, providerType);
    }
}
exports.default = APIStitchUserIdentity;
//# sourceMappingURL=APIStitchUserIdentity.js.map