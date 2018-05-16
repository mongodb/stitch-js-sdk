"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ServerAPIKeyCredential_1 = require("./ServerAPIKeyCredential");
class CoreServerAPIKeyAuthProviderClient {
    constructor(providerName) {
        this.providerName = providerName;
    }
    getCredential(key) {
        return new ServerAPIKeyCredential_1.default(this.providerName, key);
    }
}
exports.default = CoreServerAPIKeyAuthProviderClient;
//# sourceMappingURL=CoreServerAPIKeyAuthProviderClient.js.map