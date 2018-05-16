"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ProviderCapabilities_1 = require("../../ProviderCapabilities");
const ProviderTypes_1 = require("../ProviderTypes");
var Fields;
(function (Fields) {
    Fields["USERNAME"] = "username";
    Fields["PASSWORD"] = "password";
})(Fields || (Fields = {}));
class UserPasswordCredential {
    constructor(providerName, username, password) {
        this.providerType = ProviderTypes_1.default.USER_PASS;
        this.material = {
            [Fields.USERNAME]: this.username,
            [Fields.PASSWORD]: this.password
        };
        this.providerCapabilities = new ProviderCapabilities_1.default(false);
        this.providerName = providerName;
        this.username = username;
        this.password = password;
    }
}
exports.default = UserPasswordCredential;
//# sourceMappingURL=UserPasswordCredential.js.map