"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const StitchUserIdentity_1 = require("../../StitchUserIdentity");
var Fields;
(function (Fields) {
    Fields["ID"] = "id";
    Fields["PROVIDER_TYPE"] = "provider_type";
})(Fields || (Fields = {}));
class StoreStitchUserIdentity extends StitchUserIdentity_1.default {
    constructor(id, providerType) {
        super(id, providerType);
    }
}
exports.default = StoreStitchUserIdentity;
//# sourceMappingURL=StoreStitchUserIdentity.js.map