"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const AnonymousCredential_1 = require("./AnonymousCredential");
class CoreAnonymousAuthProviderClient {
    constructor(providerName) {
        this.providerName = providerName;
    }
    getCredential() {
        return new AnonymousCredential_1.default(this.providerName);
    }
}
exports.default = CoreAnonymousAuthProviderClient;
//# sourceMappingURL=CoreAnonymousAuthProviderClient.js.map