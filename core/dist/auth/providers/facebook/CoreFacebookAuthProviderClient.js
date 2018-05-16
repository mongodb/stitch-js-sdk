"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const FacebookCredential_1 = require("./FacebookCredential");
class CoreFacebookAuthProviderClient {
    constructor(providerName) {
        this.providerName = providerName;
    }
    getCredential(accessToken) {
        return new FacebookCredential_1.default(this.providerName, accessToken);
    }
}
exports.default = CoreFacebookAuthProviderClient;
//# sourceMappingURL=CoreFacebookAuthProviderClient.js.map