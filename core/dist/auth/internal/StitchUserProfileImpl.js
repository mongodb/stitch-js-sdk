"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const NAME = "name";
const EMAIL = "email";
const PICTURE_URL = "picture";
const FIRST_NAME = "first_name";
const LAST_NAME = "last_name";
const GENDER = "gender";
const BIRTHDAY = "birthday";
const MIN_AGE = "min_age";
const MAX_AGE = "max_age";
class StitchUserProfileImpl {
    static empty() {
        return new StitchUserProfileImpl();
    }
    constructor(userType, data = {}, identities = []) {
        this.userType = userType;
        this.data = data;
        this.identities = identities;
    }
    get name() {
        return this.data[NAME];
    }
    get email() {
        return this.data[EMAIL];
    }
    get pictureURL() {
        return this.data[PICTURE_URL];
    }
    get firstName() {
        return this.data[FIRST_NAME];
    }
    get lastName() {
        return this.data[LAST_NAME];
    }
    get gender() {
        return this.data[GENDER];
    }
    get birthday() {
        return this.data[BIRTHDAY];
    }
    get minAge() {
        const age = this.data[MIN_AGE];
        if (age === undefined) {
            return undefined;
        }
        return +age;
    }
    get maxAge() {
        const age = this.data[MAX_AGE];
        if (age === undefined) {
            return undefined;
        }
        return +age;
    }
}
exports.default = StitchUserProfileImpl;
//# sourceMappingURL=StitchUserProfileImpl.js.map