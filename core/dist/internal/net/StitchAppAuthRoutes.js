"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const StitchAppRoutes_1 = require("./StitchAppRoutes");
function getAuthProviderRoute(clientAppId, providerName) {
    return StitchAppRoutes_1.getAppRoute(clientAppId) + `/auth/providers/${providerName}`;
}
function getAuthProviderLoginRoute(clientAppId, providerName) {
    return getAuthProviderRoute(clientAppId, providerName) + "/login";
}
function getAuthProviderLinkRoute(clientAppId, providerName) {
    return getAuthProviderLoginRoute(clientAppId, providerName) + "?link=true";
}
class StitchAppAuthRoutes {
    constructor(clientAppId) {
        this.sessionRoute = (() => StitchAppRoutes_1.getAppRoute(this.clientAppId) + "/auth/session")();
        this.profileRoute = (() => StitchAppRoutes_1.getAppRoute(this.clientAppId) + "/auth/profile")();
        this.clientAppId = clientAppId;
    }
    getAuthProviderRoute(providerName) {
        return getAuthProviderRoute(this.clientAppId, providerName);
    }
    getAuthProviderLoginRoute(providerName) {
        return getAuthProviderLoginRoute(this.clientAppId, providerName);
    }
    getAuthProviderLinkRoute(providerName) {
        return getAuthProviderLinkRoute(this.clientAppId, providerName);
    }
}
exports.default = StitchAppAuthRoutes;
//# sourceMappingURL=StitchAppAuthRoutes.js.map