"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ContentTypes_1 = require("./internal/net/ContentTypes");
const Headers_1 = require("./internal/net/Headers");
const StitchErrorCode_1 = require("./StitchErrorCode");
const StitchRequestException_1 = require("./StitchRequestException");
const StitchServiceException_1 = require("./StitchServiceException");
var Fields;
(function (Fields) {
    Fields["ERROR"] = "error";
    Fields["ERROR_CODE"] = "error_code";
})(Fields || (Fields = {}));
class StitchError {
    static handleRequestError(response) {
        if (response.body === undefined) {
            throw new StitchRequestException_1.default(`received unexpected status code ${response.statusCode}`);
        }
        let body;
        try {
            body = response.body;
        }
        catch (e) {
            throw new StitchRequestException_1.default(e);
        }
        const errorMsg = StitchError.handleRichError(response, response.body);
        if (response.statusCode >= 400 && response.statusCode < 600) {
            throw new StitchServiceException_1.default(errorMsg);
        }
        throw new StitchRequestException_1.default(errorMsg);
    }
    static handleRichError(response, body) {
        if (response.headers[Headers_1.default.CONTENT_TYPE] !== undefined ||
            response.headers[Headers_1.default.CONTENT_TYPE] !== ContentTypes_1.default.APPLICATION_JSON) {
            return body;
        }
        const bsonObj = JSON.parse(body);
        if (!(bsonObj instanceof Object)) {
            return body;
        }
        const doc = bsonObj;
        if (doc[Fields.ERROR] === undefined) {
            return body;
        }
        const errorMsg = doc[Fields.ERROR];
        if (doc[Fields.ERROR_CODE] === undefined) {
            return errorMsg;
        }
        const errorCode = doc[Fields.ERROR_CODE];
        throw new StitchServiceException_1.default(errorMsg, StitchErrorCode_1.StitchErrorCode[errorCode]);
    }
}
exports.default = StitchError;
//# sourceMappingURL=StitchError.js.map