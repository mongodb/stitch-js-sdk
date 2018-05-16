"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ProviderCapabilities_1 = require("../../ProviderCapabilities");
const ProviderTypes_1 = require("../ProviderTypes");
const TOKEN = "token";
class CustomCredential {
    constructor(providerName, token) {
        this.providerType = ProviderTypes_1.default.CUSTOM;
        this.providerCapabilities = new ProviderCapabilities_1.default(false);
        this.providerName = providerName;
        this.token = token;
    }
    get material() {
        return { [TOKEN]: this.token };
    }
}
exports.default = CustomCredential;
//# sourceMappingURL=CustomCredential.js.map