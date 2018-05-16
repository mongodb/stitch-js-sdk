"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const JWT_1 = require("./JWT");
const SLEEP_MILLIS = 60000;
const EXPIRATION_WINDOW_SECS = 300;
class AccessTokenRefresher {
    constructor(authRef) {
        this.authRef = authRef;
    }
    checkRefresh() {
        const auth = this.authRef;
        return new Promise((resolve, reject) => {
            if (auth === undefined) {
                return resolve(false);
            }
            if (!auth.isLoggedIn) {
                return resolve(true);
            }
            const info = auth.authInfo;
            if (info === undefined) {
                return resolve(true);
            }
            let jwt;
            try {
                jwt = JWT_1.default.fromEncoded(info.accessToken);
            }
            catch (e) {
                return resolve(true);
            }
            if (Date.now() / 1000 < jwt.expires - EXPIRATION_WINDOW_SECS) {
                return resolve(true);
            }
            return resolve(auth.refreshAccessToken());
        }).then(() => {
            return true;
        });
    }
    run() {
        return new Promise((resolve, reject) => {
            resolve(this.checkRefresh());
        }).then(shouldRefresh => {
            if (!shouldRefresh) {
                return;
            }
            setTimeout(this.run, SLEEP_MILLIS);
        });
    }
}
exports.default = AccessTokenRefresher;
//# sourceMappingURL=AccessTokenRefresher.js.map