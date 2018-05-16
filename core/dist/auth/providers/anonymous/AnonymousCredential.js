"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ProviderCapabilities_1 = require("../../ProviderCapabilities");
const ProviderTypes_1 = require("../ProviderTypes");
class AnonymousCredential {
    constructor(providerName) {
        this.providerType = ProviderTypes_1.default.ANON;
        this.material = {};
        this.providerCapabilities = new ProviderCapabilities_1.default(true);
        this.providerName = providerName;
    }
}
exports.default = AnonymousCredential;
//# sourceMappingURL=AnonymousCredential.js.map