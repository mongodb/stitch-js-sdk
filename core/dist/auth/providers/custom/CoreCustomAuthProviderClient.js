"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const CustomCredential_1 = require("./CustomCredential");
class CoreCustomAuthProviderClient {
    constructor(providerName) {
        this.providerName = providerName;
    }
    getCredential(token) {
        return new CustomCredential_1.default(this.providerName, token);
    }
}
exports.default = CoreCustomAuthProviderClient;
//# sourceMappingURL=CoreCustomAuthProviderClient.js.map