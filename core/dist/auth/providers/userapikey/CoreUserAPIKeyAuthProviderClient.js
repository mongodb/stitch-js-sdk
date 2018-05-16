"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const UserAPIKeyCredential_1 = require("./UserAPIKeyCredential");
class CoreUserAPIKeyAuthProviderClient {
    constructor(providerName) {
        this.providerName = providerName;
    }
    getCredential(key) {
        return new UserAPIKeyCredential_1.default(this.providerName, key);
    }
}
exports.default = CoreUserAPIKeyAuthProviderClient;
//# sourceMappingURL=CoreUserAPIKeyAuthProviderClient.js.map