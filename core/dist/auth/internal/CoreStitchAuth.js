"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ContentTypes_1 = require("../../internal/net/ContentTypes");
const Headers_1 = require("../../internal/net/Headers");
const Method_1 = require("../../internal/net/Method");
const StitchAuthDocRequest_1 = require("../../internal/net/StitchAuthDocRequest");
const StitchAuthRequest_1 = require("../../internal/net/StitchAuthRequest");
const StitchDocRequest_1 = require("../../internal/net/StitchDocRequest");
const StitchClientException_1 = require("../../StitchClientException");
const StitchErrorCode_1 = require("../../StitchErrorCode");
const StitchServiceException_1 = require("../../StitchServiceException");
const AccessTokenRefresher_1 = require("./AccessTokenRefresher");
const AuthInfo_1 = require("./AuthInfo");
const JWT_1 = require("./JWT");
const APIAuthInfo_1 = require("./models/APIAuthInfo");
const APICoreUserProfile_1 = require("./models/APICoreUserProfile");
const StoreAuthInfo_1 = require("./models/StoreAuthInfo");
const OPTIONS = "options";
const DEVICE = "device";
class CoreStitchAuth {
    constructor(requestClient, authRoutes, storage) {
        this.requestClient = requestClient;
        this.authRoutes = authRoutes;
        this.storage = storage;
        let info;
        try {
            info = StoreAuthInfo_1.readFromStorage(storage);
        }
        catch (e) {
            throw new StitchClientException_1.default(e);
        }
        if (info === undefined) {
            this.authInfo = AuthInfo_1.default.empty();
        }
        else {
            this.authInfo = info;
        }
        this.prepUser();
        new AccessTokenRefresher_1.default(this).run();
    }
    get isLoggedIn() {
        return this.currentUser !== undefined;
    }
    get user() {
        return this.currentUser;
    }
    doAuthenticatedRequest(stitchReq) {
        return this.requestClient
            .doRequest(this.prepareAuthRequest(stitchReq))
            .catch(err => {
            return this.handleAuthFailure(err, stitchReq);
        });
    }
    doAuthenticatedJSONRequest(stitchReq) {
        return this.doAuthenticatedJSONRequestRaw(stitchReq)
            .then(response => response.body)
            .catch(err => new StitchClientException_1.default(err));
    }
    doAuthenticatedJSONRequestRaw(stitchReq) {
        const newReqBuilder = stitchReq.builder;
        newReqBuilder.withBody(stitchReq.document);
        const newHeaders = newReqBuilder.headers;
        newHeaders[Headers_1.default.CONTENT_TYPE] = ContentTypes_1.default.APPLICATION_JSON;
        newReqBuilder.withHeaders(newHeaders);
        return this.doAuthenticatedRequest(newReqBuilder.build());
    }
    refreshAccessToken() {
        const reqBuilder = new StitchAuthRequest_1.default.Builder()
            .withRefreshToken()
            .withPath(this.authRoutes.sessionRoute)
            .withMethod(Method_1.default.POST);
        return this.doAuthenticatedRequest(reqBuilder.build()).then(response => {
            const partialInfo = APIAuthInfo_1.default.readFromAPI(response.body);
            this.authInfo = this.authInfo.merge(partialInfo);
            try {
                StoreAuthInfo_1.writeToStorage(this.authInfo, this.storage);
            }
            catch (e) {
                throw new StitchClientException_1.default(e);
            }
        });
    }
    loginWithCredentialBlocking(credential) {
        if (!this.isLoggedIn) {
            return this.doLogin(credential, false);
        }
        if (credential.providerCapabilities.reusesExistingSession) {
            if (credential.providerType === this.currentUser.loggedInProviderType) {
                return new Promise((resolve, reject) => resolve(this.currentUser));
            }
        }
        this.logoutBlocking();
        return this.doLogin(credential, false);
    }
    linkUserWithCredentialBlocking(user, credential) {
        if (this.currentUser !== undefined && user.id !== this.currentUser.id) {
            throw new StitchClientException_1.default("user no longer valid; please try again with a new user from StitchAuth.getUser()");
        }
        return this.doLogin(credential, true);
    }
    logoutBlocking() {
        if (!this.isLoggedIn) {
            return;
        }
        try {
            this.doLogout();
        }
        catch (ex) {
        }
        finally {
            this.clearAuth();
        }
    }
    get hasDeviceId() {
        return (this.authInfo.deviceId !== undefined &&
            this.authInfo.deviceId !== "" &&
            this.authInfo.deviceId !== "000000000000000000000000");
    }
    get deviceId() {
        if (!this.hasDeviceId) {
            return undefined;
        }
        return this.authInfo.deviceId;
    }
    prepareAuthRequest(stitchReq) {
        if (!this.isLoggedIn) {
            throw new StitchClientException_1.default("must authenticate first");
        }
        const newReq = stitchReq.builder;
        const newHeaders = newReq.headers;
        if (stitchReq.useRefreshToken) {
            newHeaders[Headers_1.default.AUTHORIZATION] = Headers_1.default.getAuthorizationBearer(this.authInfo.refreshToken);
        }
        else {
            newHeaders[Headers_1.default.AUTHORIZATION] = Headers_1.default.getAuthorizationBearer(this.authInfo.accessToken);
        }
        newReq.withHeaders(newHeaders);
        return newReq.build();
    }
    handleAuthFailure(ex, req) {
        if (!(ex instanceof StitchServiceException_1.default) ||
            ex.errorCode !== StitchErrorCode_1.StitchErrorCode.INVALID_SESSION) {
            throw ex;
        }
        if (req.useRefreshToken) {
            this.clearAuth();
            throw ex;
        }
        this.tryRefreshAccessToken(req.startedAt);
        return this.doAuthenticatedRequest(req);
    }
    tryRefreshAccessToken(reqStartedAt) {
        if (!this.isLoggedIn) {
            throw new StitchClientException_1.default("logged out during request");
        }
        try {
            const jwt = JWT_1.default.fromEncoded(this.authInfo.accessToken);
            if (jwt.issuedAt >= reqStartedAt) {
                return;
            }
        }
        catch (e) {
        }
        try {
            this.refreshAccessToken();
        }
        catch (e) {
            throw new StitchClientException_1.default(e);
        }
    }
    prepUser() {
        if (this.authInfo.userId !== undefined) {
            this.currentUser = this.userFactory.makeUser(this.authInfo.userId, this.authInfo.loggedInProviderType, this.authInfo.loggedInProviderName, this.authInfo.userProfile);
        }
    }
    attachAuthOptions(authBody) {
        const options = {};
        options[DEVICE] = this.deviceInfo;
        authBody[OPTIONS] = options;
    }
    doLogin(credential, asLinkRequest) {
        return this.doLoginRequest(credential, asLinkRequest)
            .then(response => this.processLoginResponse(credential, response))
            .then(user => {
            this.onAuthEvent();
            return user;
        });
    }
    doLoginRequest(credential, asLinkRequest) {
        const reqBuilder = new StitchDocRequest_1.default.Builder();
        reqBuilder.withMethod(Method_1.default.POST);
        if (asLinkRequest) {
            reqBuilder.withPath(this.authRoutes.getAuthProviderLinkRoute(credential.providerName));
        }
        else {
            reqBuilder.withPath(this.authRoutes.getAuthProviderLoginRoute(credential.providerName));
        }
        const material = credential.material;
        this.attachAuthOptions(material);
        reqBuilder.withDocument(material);
        if (!asLinkRequest) {
            return this.requestClient.doJSONRequestRaw(reqBuilder.build());
        }
        const linkRequest = new StitchAuthDocRequest_1.default(reqBuilder.build(), reqBuilder.document);
        return this.doAuthenticatedJSONRequestRaw(linkRequest);
    }
    processLoginResponse(credential, response) {
        let newAuthInfo;
        try {
            newAuthInfo = APIAuthInfo_1.default.readFromAPI(response.body);
        }
        catch (e) {
            throw new StitchClientException_1.default(e);
        }
        newAuthInfo = this.authInfo.merge(new AuthInfo_1.default(newAuthInfo.userId, newAuthInfo.deviceId, newAuthInfo.accessToken, newAuthInfo.refreshToken, credential.providerType, credential.providerName, undefined));
        const oldInfo = this.authInfo;
        this.authInfo = newAuthInfo;
        this.currentUser = this.userFactory.makeUser(this.authInfo.userId, credential.providerType, credential.providerName, undefined);
        return this.doGetUserProfile()
            .then(profile => {
            newAuthInfo = newAuthInfo.merge(new AuthInfo_1.default(newAuthInfo.userId, newAuthInfo.deviceId, newAuthInfo.accessToken, newAuthInfo.refreshToken, credential.providerType, credential.providerName, profile));
            try {
                StoreAuthInfo_1.writeToStorage(newAuthInfo, this.storage);
            }
            catch (e) {
                throw new StitchClientException_1.default(e);
            }
            this.authInfo = newAuthInfo;
            this.currentUser = this.userFactory.makeUser(this.authInfo.userId, credential.providerType, credential.providerName, profile);
            return this.currentUser;
        })
            .catch(err => {
            this.authInfo = oldInfo;
            this.currentUser = undefined;
            throw err;
        });
    }
    doGetUserProfile() {
        const reqBuilder = new StitchAuthRequest_1.default.Builder();
        reqBuilder.withMethod(Method_1.default.GET).withPath(this.authRoutes.profileRoute);
        return this.doAuthenticatedRequest(reqBuilder.build())
            .then(response => APICoreUserProfile_1.default.decodeFrom(response.body))
            .catch(err => {
            throw new StitchClientException_1.default(err);
        });
    }
    doLogout() {
        const reqBuilder = new StitchAuthRequest_1.default.Builder();
        reqBuilder
            .withRefreshToken()
            .withPath(this.authRoutes.sessionRoute)
            .withMethod(Method_1.default.DELETE);
        return this.doAuthenticatedRequest(reqBuilder.build());
    }
    clearAuth() {
        if (!this.isLoggedIn) {
            return;
        }
        this.authInfo = this.authInfo.loggedOut();
        try {
            StoreAuthInfo_1.writeToStorage(this.authInfo, this.storage);
        }
        catch (e) {
            throw new StitchClientException_1.default(e);
        }
        this.currentUser = undefined;
        this.onAuthEvent();
    }
}
exports.default = CoreStitchAuth;
//# sourceMappingURL=CoreStitchAuth.js.map