"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const StitchErrorCode_1 = require("./StitchErrorCode");
const StitchRequestException_1 = require("./StitchRequestException");
class StitchServiceException extends StitchRequestException_1.default {
    constructor(message, errorCode = StitchErrorCode_1.StitchErrorCode.UNKNOWN) {
        super(message);
        this.errorCode = errorCode;
    }
}
exports.default = StitchServiceException;
//# sourceMappingURL=StitchServiceException.js.map