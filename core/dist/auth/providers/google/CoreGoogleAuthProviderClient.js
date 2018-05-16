"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const GoogleCredential_1 = require("./GoogleCredential");
class CoreGoogleAuthProviderClient {
    constructor(providerName) {
        this.providerName = providerName;
    }
    getCredential(authCode) {
        return new GoogleCredential_1.default(this.providerName, authCode);
    }
}
exports.default = CoreGoogleAuthProviderClient;
//# sourceMappingURL=CoreGoogleAuthProviderClient.js.map