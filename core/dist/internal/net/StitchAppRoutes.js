"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const StitchServiceRoutes_1 = require("../../services/internal/StitchServiceRoutes");
const StitchAppAuthRoutes_1 = require("./StitchAppAuthRoutes");
const BASE_ROUTE = "/api/client/v2.0";
exports.BASE_ROUTE = BASE_ROUTE;
function getAppRoute(clientAppId) {
    return BASE_ROUTE + `/app/${clientAppId}`;
}
exports.getAppRoute = getAppRoute;
function getFunctionCallRoute(clientAppId) {
    return getAppRoute(clientAppId) + "/functions/call";
}
exports.getFunctionCallRoute = getFunctionCallRoute;
class StitchAppRoutes {
    constructor(clientAppId) {
        this.clientAppId = clientAppId;
        this.authRoutes = new StitchAppAuthRoutes_1.default(clientAppId);
        this.serviceRoutes = new StitchServiceRoutes_1.default(clientAppId);
        this.functionCallRoute = getFunctionCallRoute(clientAppId);
    }
}
exports.StitchAppRoutes = StitchAppRoutes;
//# sourceMappingURL=StitchAppRoutes.js.map