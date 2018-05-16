"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ProviderCapabilities_1 = require("../../ProviderCapabilities");
const ProviderTypes_1 = require("../ProviderTypes");
var Fields;
(function (Fields) {
    Fields["KEY"] = "key";
})(Fields || (Fields = {}));
class ServerAPIKeyCredential {
    constructor(providerName, key) {
        this.providerType = ProviderTypes_1.default.SERVER_API_KEY;
        this.material = (() => {
            return { [Fields.KEY]: this.key };
        })();
        this.providerCapabilities = new ProviderCapabilities_1.default(false);
        this.providerName = providerName;
        this.key = key;
    }
}
exports.default = ServerAPIKeyCredential;
//# sourceMappingURL=ServerAPIKeyCredential.js.map