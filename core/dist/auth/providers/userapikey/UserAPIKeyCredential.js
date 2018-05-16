"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ProviderCapabilities_1 = require("../../ProviderCapabilities");
const ProviderTypes_1 = require("../ProviderTypes");
var Fields;
(function (Fields) {
    Fields["KEY"] = "key";
})(Fields || (Fields = {}));
class UserAPIKeyCredential {
    constructor(providerName, key) {
        this.providerType = ProviderTypes_1.default.USER_API_KEY;
        this.material = {
            [Fields.KEY]: this.key
        };
        this.providerCapabilities = new ProviderCapabilities_1.default(false);
        this.providerName = providerName;
        this.key = key;
    }
}
exports.default = UserAPIKeyCredential;
//# sourceMappingURL=UserAPIKeyCredential.js.map