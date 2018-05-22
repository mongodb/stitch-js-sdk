import { MemoryStorage } from "../../../internal/common/Storage";
import ContentTypes from "../../../internal/net/ContentTypes";
import FetchTransport from "../../../internal/net/FetchTransport";
import Headers from "../../../internal/net/Headers";
import Response from "../../../internal/net/Response";
import { StitchAppRoutes } from "../../../internal/net/StitchAppRoutes";
import StitchAuthRequest from "../../../internal/net/StitchAuthRequest";
import StitchDocRequest from "../../../internal/net/StitchDocRequest";
import StitchRequest from "../../../internal/net/StitchRequest";
import StitchRequestClient from "../../../internal/net/StitchRequestClient";
import StitchServiceException from "../../../StitchServiceException";
import { StitchServiceErrorCode } from "../../../StitchServiceErrorCode";
import ProviderTypes from "../../providers/ProviderTypes";
import CoreUserPasswordAuthProviderClient from "../../providers/userpass/CoreUserPasswordAuthProviderClient";
import UserPasswordCredential from "../../providers/userpass/UserPasswordCredential";
import StitchCredential from "../../StitchCredential";
import CoreStitchAuth from "../CoreStitchAuth";
import CoreStitchUser from "../CoreStitchUser";
import CoreStitchUserImpl from "../CoreStitchUserImpl";
import APIAuthInfo from "../models/APIAuthInfo";
import StitchUserFactory from "../StitchUserFactory";
import StitchUserProfileImpl from "../StitchUserProfileImpl";
import { AnonymousCredential } from "../../..";

const USER_ID = "<user_id-hex>";

class MockRequestClient extends StitchRequestClient {
  public static readonly APP_ROUTES = new StitchAppRoutes("<app-id>");
  public static readonly MOCK_API_PROFILE = {
    data: {},
    identities: [
      {
        id: "bar",
        provider_type: "baz"
      }
    ],
    type: "foo"
  };

  public static readonly MOCK_API_AUTH_INFO = {
    access_token: "access_token",
    device_id: "device_id",
    refresh_token: "refresh_token",
    user_id: USER_ID
  };

  public static readonly MOCK_SESSION_INFO = {
    access_token: "<access-token>"
  };

  public static readonly BASE_JSON_HEADERS = {
    [Headers.CONTENT_TYPE]: ContentTypes.APPLICATION_JSON
  };

  constructor() {
    super("http://localhost:8080", new FetchTransport());
  }

  public doJSONRequestRaw(stitchReq: StitchDocRequest): Promise<Response> {
    return this.handleRequest(stitchReq)!;
  }

  public doRequest(stitchReq: StitchRequest): Promise<Response> {
    return this.handleRequest(stitchReq)!;
  }

  public handleAuthProviderLoginRoute = (request: StitchRequest): Response => {
    return {
      body: MockRequestClient.MOCK_API_AUTH_INFO,
      headers: MockRequestClient.BASE_JSON_HEADERS,
      statusCode: 200
    };
  };

  public handleAuthProviderLinkRoute = (request: StitchRequest) => {
    return {
      body: MockRequestClient.MOCK_API_AUTH_INFO,
      headers: MockRequestClient.BASE_JSON_HEADERS,
      statusCode: 200
    };
  };

  private handleProfileRoute = (request: StitchRequest) => {
    return {
      body: MockRequestClient.MOCK_API_PROFILE,
      headers: MockRequestClient.BASE_JSON_HEADERS,
      statusCode: 200
    };
  };

  private handleSessionRoute = (request: StitchRequest) => {
    return {
      body: MockRequestClient.MOCK_SESSION_INFO,
      headers: MockRequestClient.BASE_JSON_HEADERS,
      statusCode: 200
    };
  };

  private handleRequest(request: StitchRequest): Promise<Response> {
    return new Promise((resolve) => {
      switch (request.path) {
        case MockRequestClient.APP_ROUTES.authRoutes.getAuthProviderLoginRoute(
          "anon-user"
        ):
          resolve(this.handleAuthProviderLoginRoute.apply(request));
        case MockRequestClient.APP_ROUTES.authRoutes.profileRoute:
          resolve(this.handleProfileRoute.apply(request));
        case MockRequestClient.APP_ROUTES.authRoutes.getAuthProviderLinkRoute(
          "local-userpass"
        ):
          resolve(this.handleAuthProviderLinkRoute.apply(request));
        case MockRequestClient.APP_ROUTES.authRoutes.sessionRoute:
          resolve(this.handleSessionRoute.apply(request));
        default:
          resolve(undefined);
      }
    });
  }
}

const MockCoreStitchAuth = class extends CoreStitchAuth<CoreStitchUserImpl> {
  public authenticatedRequestFired = 0;

  get deviceInfo() {
    return {};
  }

  public get hasDeviceId() {
    return super.hasDeviceId;
  }

  private userFactoryInst = new class
    implements StitchUserFactory<CoreStitchUserImpl> {
    public makeUser(
      id: string,
      loggedInProviderType: string,
      loggedInProviderName: string,
      userProfile?: StitchUserProfileImpl
    ): CoreStitchUserImpl {
      return new class extends CoreStitchUserImpl {
        constructor() {
          super(id, loggedInProviderType, loggedInProviderName, userProfile);
        }
      }();
    }
  }();

  constructor(mockRequestClient: MockRequestClient) {
    super(
      mockRequestClient,
      MockRequestClient.APP_ROUTES.authRoutes,
      new MemoryStorage()
    );
  }

  public doAuthenticatedRequest(
    stitchReq: StitchAuthRequest
  ): Promise<Response> {
    this.authenticatedRequestFired++;
    return super.doAuthenticatedRequest(stitchReq);
  }

  public loginWithCredential(
    credential: StitchCredential
  ): Promise<CoreStitchUserImpl> {
    return super.loginWithCredential(credential);
  }

  public linkUserWithCredential(
    user: CoreStitchUser,
    credential: StitchCredential
  ): Promise<CoreStitchUserImpl> {
    return super.linkUserWithCredential(user, credential);
  }

  public logout() {
    super.logout();
  }

  protected get userFactory(): StitchUserFactory<CoreStitchUserImpl> {
    return this.userFactoryInst;
  }

  protected onAuthEvent() {
    return;
  }
};

describe("CoreStitchAuthUnitTests", () => {
  it("should login with credential", () => {
    expect.assertions(5);

    const coreStitchAuth = new MockCoreStitchAuth(new MockRequestClient());

    return coreStitchAuth
      .loginWithCredential(new AnonymousCredential())
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
      .loginWithCredential(new AnonymousCredential())
      .then(user => {
        return coreStitchAuth.linkUserWithCredential(
          user,
          new UserPasswordCredential(
            "foo@foo.com",
            "bar"
          )
        )
      })
      .then(linkedUser => {
        expect(linkedUser.id).toEqual(coreStitchAuth.user!.id);
      });
  });

  it("should reflect logged in state with `isLoggedIn`", () => {
    expect.assertions(1);

    const coreStitchAuth = new MockCoreStitchAuth(new MockRequestClient());

    return coreStitchAuth
      .loginWithCredential(new AnonymousCredential())
      .then(() => {
        expect(coreStitchAuth.isLoggedIn).toBeTruthy();
      });
  });

  it("should logout", () => {
    expect.assertions(3);

    const coreStitchAuth = new MockCoreStitchAuth(new MockRequestClient());

    expect(coreStitchAuth.isLoggedIn).toBeFalsy();

    return coreStitchAuth
      .loginWithCredential(new AnonymousCredential())
      .then(() => {
        expect(coreStitchAuth.isLoggedIn).toBeTruthy();
        return coreStitchAuth.logout();
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
      .loginWithCredential(new AnonymousCredential())
      .then(() => {
        expect(coreStitchAuth.hasDeviceId).toBeTruthy();
      });
  });

  it("should handle auth failure", () => {
    expect.assertions(1);

    const mockRequestClient = new MockRequestClient();
    const coreStitchAuth = new MockCoreStitchAuth(mockRequestClient);

    const oldLinkFunc = mockRequestClient.handleAuthProviderLinkRoute;
    mockRequestClient.handleAuthProviderLinkRoute = (
      request: StitchRequest
    ) => {
      mockRequestClient.handleAuthProviderLinkRoute = oldLinkFunc;

      throw new StitchServiceException(
        "InvalidSession",
        StitchServiceErrorCode.INVALID_SESSION
      );
    };

    return coreStitchAuth
      .loginWithCredential(new AnonymousCredential())
      .then(user =>
        coreStitchAuth.linkUserWithCredential(
          user,
          new UserPasswordCredential(
            "foo@foo.com",
            "bar"
          )
        )
      )
      .then(() => {
        expect(5).toEqual(coreStitchAuth.authenticatedRequestFired);
      });
  });
});
