"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Method_1 = require("../../../internal/net/Method");
const StitchDocRequest_1 = require("../../../internal/net/StitchDocRequest");
const CoreAuthProviderClient_1 = require("../CoreAuthProviderClient");
const UserPasswordCredential_1 = require("./UserPasswordCredential");
var RegistrationFields;
(function (RegistrationFields) {
    RegistrationFields["EMAIL"] = "email";
    RegistrationFields["PASSWORD"] = "password";
})(RegistrationFields || (RegistrationFields = {}));
var ActionFields;
(function (ActionFields) {
    ActionFields["EMAIL"] = "email";
    ActionFields["PASSWORD"] = "password";
    ActionFields["TOKEN"] = "token";
    ActionFields["TOKEN_ID"] = "tokenId";
})(ActionFields || (ActionFields = {}));
class CoreUserPasswordAuthProviderClient extends CoreAuthProviderClient_1.default {
    constructor(providerName, requestClient, authRoutes) {
        super(providerName, requestClient, authRoutes);
    }
    getCredential(username, password) {
        return new UserPasswordCredential_1.default(this.providerName, username, password);
    }
    registerWithEmailInternal(email, password) {
        const reqBuilder = new StitchDocRequest_1.default.Builder();
        reqBuilder
            .withMethod(Method_1.default.POST)
            .withPath(this.getRegisterWithEmailRoute());
        reqBuilder.withDocument({
            [RegistrationFields.EMAIL]: email,
            [RegistrationFields.PASSWORD]: password
        });
        this.requestClient.doJSONRequestRaw(reqBuilder.build());
    }
    confirmUserInternal(token, tokenId) {
        const reqBuilder = new StitchDocRequest_1.default.Builder();
        reqBuilder.withMethod(Method_1.default.POST).withPath(this.getConfirmUserRoute());
        reqBuilder.withDocument({
            [ActionFields.TOKEN]: token,
            [ActionFields.TOKEN_ID]: tokenId
        });
        this.requestClient.doJSONRequestRaw(reqBuilder.build());
    }
    resendConfirmationEmailInternal(email) {
        const reqBuilder = new StitchDocRequest_1.default.Builder();
        reqBuilder
            .withMethod(Method_1.default.POST)
            .withPath(this.getResendConfirmationEmailRoute());
        reqBuilder.withDocument({ [ActionFields.EMAIL]: email });
        this.requestClient.doJSONRequestRaw(reqBuilder.build());
    }
    resetPasswordInternal(token, tokenId, password) {
        const reqBuilder = new StitchDocRequest_1.default.Builder();
        reqBuilder.withMethod(Method_1.default.POST).withPath(this.getResetPasswordRoute());
        reqBuilder.withDocument({
            [ActionFields.TOKEN]: token,
            [ActionFields.TOKEN_ID]: tokenId,
            [ActionFields.PASSWORD]: password
        });
        this.requestClient.doJSONRequestRaw(reqBuilder.build());
    }
    sendResetPasswordEmailInternal(email) {
        const reqBuilder = new StitchDocRequest_1.default.Builder();
        reqBuilder
            .withMethod(Method_1.default.POST)
            .withPath(this.getSendResetPasswordEmailRoute());
        reqBuilder.withDocument({ [ActionFields.EMAIL]: email });
        this.requestClient.doJSONRequestRaw(reqBuilder.build());
    }
    getRegisterWithEmailRoute() {
        return this.getExtensionRoute("/register");
    }
    getConfirmUserRoute() {
        return this.getExtensionRoute("/confirm");
    }
    getResendConfirmationEmailRoute() {
        return this.getExtensionRoute("/confirm/send");
    }
    getResetPasswordRoute() {
        return this.getExtensionRoute("/reset");
    }
    getSendResetPasswordEmailRoute() {
        return this.getExtensionRoute("/reset/send");
    }
    getExtensionRoute(path) {
        return `${this.authRoutes.getAuthProviderRoute(this.providerName)}/${path}`;
    }
}
exports.default = CoreUserPasswordAuthProviderClient;
//# sourceMappingURL=CoreUserPasswordAuthProviderClient.js.map