"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Storage_1 = require("../../../internal/common/Storage");
const ContentTypes_1 = require("../../../internal/net/ContentTypes");
const FetchTransport_1 = require("../../../internal/net/FetchTransport");
const Headers_1 = require("../../../internal/net/Headers");
const StitchAppRoutes_1 = require("../../../internal/net/StitchAppRoutes");
const StitchRequestClient_1 = require("../../../internal/net/StitchRequestClient");
const StitchErrorCode_1 = require("../../../StitchErrorCode");
const StitchServiceException_1 = require("../../../StitchServiceException");
const CoreAnonymousAuthProviderClient_1 = require("../../providers/anonymous/CoreAnonymousAuthProviderClient");
const ProviderTypes_1 = require("../../providers/ProviderTypes");
const UserPasswordCredential_1 = require("../../providers/userpass/UserPasswordCredential");
const CoreStitchAuth_1 = require("../CoreStitchAuth");
const CoreStitchUserImpl_1 = require("../CoreStitchUserImpl");
const USER_ID = "<user_id-hex>";
class MockRequestClient extends StitchRequestClient_1.default {
    constructor() {
        super("http://localhost:8080", new FetchTransport_1.default());
        this.handleAuthProviderLoginRoute = (request) => {
            return {
                body: MockRequestClient.MOCK_API_AUTH_INFO,
                headers: MockRequestClient.BASE_JSON_HEADERS,
                statusCode: 200
            };
        };
        this.handleAuthProviderLinkRoute = (request) => {
            return {
                body: MockRequestClient.MOCK_API_AUTH_INFO,
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
MockRequestClient.MOCK_API_AUTH_INFO = {
    access_token: "access_token",
    device_id: "device_id",
    refresh_token: "refresh_token",
    user_id: USER_ID
};
MockRequestClient.MOCK_SESSION_INFO = {
    access_token: "<access-token>"
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
describe("CoreStitchAuthUnitTests", () => {
    it("should login with credential", () => {
        expect.assertions(5);
        const coreStitchAuth = new MockCoreStitchAuth(new MockRequestClient());
        return coreStitchAuth
            .loginWithCredentialBlocking(new class extends CoreAnonymousAuthProviderClient_1.default {
            constructor() {
                super(ProviderTypes_1.default.ANON);
            }
        }().getCredential())
            .then(user => {
            expect(user.id).toEqual(USER_ID);
            expect(user.loggedInProviderName).toEqual("anon-user");
            expect(user.loggedInProviderType).toEqual("anon-user");
            expect(user.userType).toEqual("foo");
            expect(user.identities[0].id).toEqual("bar");
        })
            .catch(err => {
            throw err;
        });
    });
    it("should link user with credential", () => {
        expect.assertions(1);
        const coreStitchAuth = new MockCoreStitchAuth(new MockRequestClient());
        return coreStitchAuth
            .loginWithCredentialBlocking(new class extends CoreAnonymousAuthProviderClient_1.default {
            constructor() {
                super(ProviderTypes_1.default.ANON);
            }
        }().getCredential())
            .then(user => coreStitchAuth.linkUserWithCredentialBlocking(user, new UserPasswordCredential_1.default(ProviderTypes_1.default.USER_PASS, "foo@foo.com", "bar")))
            .then(linkedUser => {
            expect(linkedUser.id).toEqual(coreStitchAuth.user.id);
        });
    });
    it("should reflect logged in state with `isLoggedIn`", () => {
        expect.assertions(1);
        const coreStitchAuth = new MockCoreStitchAuth(new MockRequestClient());
        return coreStitchAuth
            .loginWithCredentialBlocking(new class extends CoreAnonymousAuthProviderClient_1.default {
            constructor() {
                super(ProviderTypes_1.default.ANON);
            }
        }().getCredential())
            .then(() => {
            expect(coreStitchAuth.isLoggedIn).toBeTruthy();
        });
    });
    it("should logout", () => {
        expect.assertions(3);
        const coreStitchAuth = new MockCoreStitchAuth(new MockRequestClient());
        expect(coreStitchAuth.isLoggedIn).toBeFalsy();
        return coreStitchAuth
            .loginWithCredentialBlocking(new class extends CoreAnonymousAuthProviderClient_1.default {
            constructor() {
                super(ProviderTypes_1.default.ANON);
            }
        }().getCredential())
            .then(() => {
            expect(coreStitchAuth.isLoggedIn).toBeTruthy();
            return coreStitchAuth.logoutBlocking();
        })
            .then(() => {
            expect(coreStitchAuth.isLoggedIn).toBeFalsy();
        });
    });
    it("should have device id", () => {
        expect.assertions(2);
        const coreStitchAuth = new MockCoreStitchAuth(new MockRequestClient());
        expect(coreStitchAuth.hasDeviceId).toBeFalsy();
        return coreStitchAuth
            .loginWithCredentialBlocking(new class extends CoreAnonymousAuthProviderClient_1.default {
            constructor() {
                super(ProviderTypes_1.default.ANON);
            }
        }().getCredential())
            .then(() => {
            expect(coreStitchAuth.hasDeviceId).toBeTruthy();
        });
    });
    it("should handle auth failure", () => {
        expect.assertions(1);
        const mockRequestClient = new MockRequestClient();
        const coreStitchAuth = new MockCoreStitchAuth(mockRequestClient);
        const oldLinkFunc = mockRequestClient.handleAuthProviderLinkRoute;
        mockRequestClient.handleAuthProviderLinkRoute = (request) => {
            mockRequestClient.handleAuthProviderLinkRoute = oldLinkFunc;
            throw new StitchServiceException_1.default("InvalidSession", StitchErrorCode_1.StitchErrorCode.INVALID_SESSION);
        };
        return coreStitchAuth
            .loginWithCredentialBlocking(new class extends CoreAnonymousAuthProviderClient_1.default {
            constructor() {
                super(ProviderTypes_1.default.ANON);
            }
        }().getCredential())
            .then(user => coreStitchAuth.linkUserWithCredentialBlocking(user, new UserPasswordCredential_1.default(ProviderTypes_1.default.USER_PASS, "foo@foo.com", "bar")))
            .then(() => {
            expect(5).toEqual(coreStitchAuth.authenticatedRequestFired);
        });
    });
});
//# sourceMappingURL=CoreStitchAuthUnitTests.test.js.map