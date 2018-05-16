"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const StitchAppRoutes_1 = require("../../internal/net/StitchAppRoutes");
class StitchServiceRoutes {
    constructor(clientAppId) {
        this.clientAppId = clientAppId;
        this.functionCallRoute = StitchAppRoutes_1.getFunctionCallRoute(clientAppId);
    }
}
exports.default = StitchServiceRoutes;
//# sourceMappingURL=StitchServiceRoutes.js.map