"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const StitchUserProfileImpl_1 = require("./StitchUserProfileImpl");
class CoreStitchUserImpl {
    constructor(id, loggedInProviderType, loggedInProviderName, profile) {
        this.id = id;
        this.loggedInProviderType = loggedInProviderType;
        this.loggedInProviderName = loggedInProviderName;
        this.profile =
            profile === undefined ? StitchUserProfileImpl_1.default.empty() : profile;
    }
    get userType() {
        return this.profile.userType;
    }
    get identities() {
        return this.profile.identities;
    }
}
exports.default = CoreStitchUserImpl;
//# sourceMappingURL=CoreStitchUserImpl.js.map