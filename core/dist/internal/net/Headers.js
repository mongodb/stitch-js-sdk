"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Headers {
    static getAuthorizationBearer(value) {
        return `${Headers.AUTHORIZATION_BEARER} ${value}`;
    }
}
Headers.CONTENT_TYPE = "Content-Type";
Headers.AUTHORIZATION = "Authorization";
Headers.AUTHORIZATION_BEARER = "Bearer";
exports.default = Headers;
//# sourceMappingURL=Headers.js.map