"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ProviderCapabilities_1 = require("../../ProviderCapabilities");
const ProviderTypes_1 = require("../ProviderTypes");
const ACCESS_TOKEN = "accessToken";
class FacebookCredential {
    constructor(providerName, accessToken) {
        this.providerType = ProviderTypes_1.default.FACEBOOK;
        this.providerName = providerName;
        this.accessToken = accessToken;
    }
    get material() {
        return {
            [ACCESS_TOKEN]: this.accessToken
        };
    }
    get providerCapabilities() {
        return new ProviderCapabilities_1.default(false);
    }
}
exports.default = FacebookCredential;
//# sourceMappingURL=FacebookCredential.js.map