"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ProviderCapabilities_1 = require("../../ProviderCapabilities");
const ProviderTypes_1 = require("../ProviderTypes");
var Fields;
(function (Fields) {
    Fields["AUTH_CODE"] = "authCode";
})(Fields || (Fields = {}));
class GoogleCredential {
    constructor(providerName, authCode) {
        this.providerType = ProviderTypes_1.default.GOOGLE;
        this.material = (() => {
            return { [Fields.AUTH_CODE]: this.authCode };
        })();
        this.providerCapabilities = new ProviderCapabilities_1.default(false);
        this.providerName = providerName;
        this.authCode = authCode;
    }
}
exports.default = GoogleCredential;
//# sourceMappingURL=GoogleCredential.js.map