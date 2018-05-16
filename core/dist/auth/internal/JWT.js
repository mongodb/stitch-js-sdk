"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const StitchClientException_1 = require("../../StitchClientException");
function b64DecodeUnicode(str) {
    return decodeURIComponent(atob(str)
        .split("")
        .map(c => {
        return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
    })
        .join(""));
}
const EXPIRES = "exp";
const ISSUED_AT = "iat";
class JWT {
    static fromEncoded(encodedJWT) {
        const parts = JWT.splitToken(encodedJWT);
        const json = JSON.parse(b64DecodeUnicode(parts[1]));
        const expires = json[EXPIRES];
        const iat = json[ISSUED_AT];
        return new JWT(expires, iat);
    }
    static splitToken(jwt) {
        const parts = jwt.split(".");
        if (parts.length !== 3) {
            throw new StitchClientException_1.default(`Malformed JWT token. The string ${jwt} should have 3 parts.`);
        }
        return parts;
    }
    constructor(expires, issuedAt) {
        this.expires = expires;
        this.issuedAt = issuedAt;
    }
}
exports.default = JWT;
//# sourceMappingURL=JWT.js.map