"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = require("jsonwebtoken");
const Storage_1 = require("../../../internal/common/Storage");
const ContentTypes_1 = require("../../../internal/net/ContentTypes");
const FetchTransport_1 = require("../../../internal/net/FetchTransport");
const Headers_1 = require("../../../internal/net/Headers");
const StitchAppRoutes_1 = require("../../../internal/net/StitchAppRoutes");
const StitchRequestClient_1 = require("../../../internal/net/StitchRequestClient");
const CoreAnonymousAuthProviderClient_1 = require("../../providers/anonymous/CoreAnonymousAuthProviderClient");
const ProviderTypes_1 = require("../../providers/ProviderTypes");
const AccessTokenRefresher_1 = require("../AccessTokenRefresher");
const CoreStitchAuth_1 = require("../CoreStitchAuth");
const CoreStitchUserImpl_1 = require("../CoreStitchUserImpl");
class MockRequestClient extends StitchRequestClient_1.default {
    constructor() {
        super("http://localhost:8080", new FetchTransport_1.default());
        this.handleAuthProviderLoginRoute = (request) => {
            return {
                body: MockRequestClient.MOCK_GOOD_AUTH_INFO,
                headers: MockRequestClient.BASE_JSON_HEADERS,
                statusCode: 200
            };
        };
        this.handleAuthProviderLinkRoute = (request) => {
            return {
                body: MockRequestClient.MOCK_GOOD_AUTH_INFO,
                headers: MockRequestClient.BASE_JSON_HEADERS,
                statusCode: 200
            };
        };
        this.handleProfileRoute = (request) => {
            return {
                body: MockRequestClient.MOCK_API_PROFILE,
                headers: MockRequestClient.BASE_JSON_HEADERS,
                statusCode: 200
            };
        };
        this.handleSessionRoute = (request) => {
            return {
                body: MockRequestClient.MOCK_SESSION_INFO,
                headers: MockRequestClient.BASE_JSON_HEADERS,
                statusCode: 200
            };
        };
    }
    doJSONRequestRaw(stitchReq) {
        return this.handleRequest(stitchReq);
    }
    doRequest(stitchReq) {
        return this.handleRequest(stitchReq);
    }
    handleRequest(request) {
        return new Promise((resolve, reject) => {
            if (request.path ===
                MockRequestClient.APP_ROUTES.authRoutes.getAuthProviderLoginRoute("anon-user")) {
                resolve(this.handleAuthProviderLoginRoute.apply(request));
            }
            else if (request.path === MockRequestClient.APP_ROUTES.authRoutes.profileRoute) {
                resolve(this.handleProfileRoute.apply(request));
            }
            else if (request.path ===
                MockRequestClient.APP_ROUTES.authRoutes.getAuthProviderLinkRoute("local-userpass")) {
                resolve(this.handleAuthProviderLinkRoute.apply(request));
            }
            else if (request.path === MockRequestClient.APP_ROUTES.authRoutes.sessionRoute) {
                resolve(this.handleSessionRoute.apply(request));
            }
            resolve(undefined);
        });
    }
}
MockRequestClient.APP_ROUTES = new StitchAppRoutes_1.StitchAppRoutes("<app-id>");
MockRequestClient.USER_ID = "<user_id-hex>";
MockRequestClient.MOCK_API_PROFILE = {
    data: {},
    identities: [
        {
            id: "bar",
            provider_type: "baz"
        }
    ],
    type: "foo"
};
MockRequestClient.MOCK_EXPIRED_AUTH_INFO = {
    access_token: jsonwebtoken_1.sign({
        exp: Math.floor(Date.now() / 1000) - 30,
        iat: Math.floor(Date.now() / 1000) - 60
    }, "shhhhh"),
    device_id: "device_id",
    refresh_token: "refresh_token",
    user_id: MockRequestClient.USER_ID
};
MockRequestClient.MOCK_GOOD_AUTH_INFO = {
    access_token: jsonwebtoken_1.sign({
        exp: Math.floor(Date.now() / 1000) + 400,
        iat: Math.floor(Date.now() / 1000) - 30
    }, "shhhhh"),
    device_id: "device_id",
    refresh_token: "refresh_token",
    user_id: MockRequestClient.USER_ID
};
MockRequestClient.MOCK_SESSION_INFO = {
    access_token: jsonwebtoken_1.sign({
        exp: Math.floor(Date.now() / 1000) + 400,
        iat: Math.floor(Date.now() / 1000) - 30
    }, "shhhhh")
};
MockRequestClient.BASE_JSON_HEADERS = {
    [Headers_1.default.CONTENT_TYPE]: ContentTypes_1.default.APPLICATION_JSON
};
const MockCoreStitchAuth = class extends CoreStitchAuth_1.default {
    constructor(mockRequestClient) {
        super(mockRequestClient, MockRequestClient.APP_ROUTES.authRoutes, new Storage_1.MemoryStorage());
        this.authenticatedRequestFired = 0;
        this.userFactoryInst = new class {
            makeUser(id, loggedInProviderType, loggedInProviderName, userProfile) {
                return new class extends CoreStitchUserImpl_1.default {
                    constructor() {
                        super(id, loggedInProviderType, loggedInProviderName, userProfile);
                    }
                }();
            }
        }();
    }
    get deviceInfo() {
        return {};
    }
    get hasDeviceId() {
        return super.hasDeviceId;
    }
    doAuthenticatedRequest(stitchReq) {
        this.authenticatedRequestFired++;
        return super.doAuthenticatedRequest(stitchReq);
    }
    loginWithCredentialBlocking(credential) {
        return super.loginWithCredentialBlocking(credential);
    }
    linkUserWithCredentialBlocking(user, credential) {
        return super.linkUserWithCredentialBlocking(user, credential);
    }
    logoutBlocking() {
        super.logoutBlocking();
    }
    get userFactory() {
        return this.userFactoryInst;
    }
    onAuthEvent() {
        return;
    }
};
describe("AccessTokenRefresher", () => {
    it("should check refresh", () => {
        const mockRequestClient = new MockRequestClient();
        mockRequestClient.handleAuthProviderLoginRoute = (request) => {
            return {
                body: MockRequestClient.MOCK_GOOD_AUTH_INFO,
                headers: MockRequestClient.BASE_JSON_HEADERS,
                statusCode: 200
            };
        };
        const mockCoreAuth = new MockCoreStitchAuth(mockRequestClient);
        const accessTokenRefresher = new AccessTokenRefresher_1.default(mockCoreAuth);
        return mockCoreAuth
            .loginWithCredentialBlocking(new class extends CoreAnonymousAuthProviderClient_1.default {
            constructor() {
                super(ProviderTypes_1.default.ANON);
            }
        }().getCredential())
            .then(() => {
            expect(mockCoreAuth.authenticatedRequestFired).toEqual(1);
            return accessTokenRefresher.checkRefresh();
        })
            .then(() => {
            expect(1).toEqual(mockCoreAuth.authenticatedRequestFired);
            mockRequestClient.handleAuthProviderLoginRoute = (request) => {
                return {
                    body: MockRequestClient.MOCK_EXPIRED_AUTH_INFO,
                    headers: MockRequestClient.BASE_JSON_HEADERS,
                    statusCode: 200
                };
            };
            return mockCoreAuth.logoutBlocking();
        })
            .then(() => {
            return mockCoreAuth.loginWithCredentialBlocking(new class extends CoreAnonymousAuthProviderClient_1.default {
                constructor() {
                    super(ProviderTypes_1.default.ANON);
                }
            }().getCredential());
        })
            .then(() => {
            expect(mockCoreAuth.authenticatedRequestFired).toEqual(3);
            return accessTokenRefresher.checkRefresh();
        })
            .then(() => {
            expect(mockCoreAuth.authenticatedRequestFired).toEqual(4);
        });
    });
});
//# sourceMappingURL=AccessTokenRefresherUnitTests.test.js.map