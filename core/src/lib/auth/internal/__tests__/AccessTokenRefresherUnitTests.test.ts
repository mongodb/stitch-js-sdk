import { sign } from "jsonwebtoken";
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
import { StitchErrorCode } from "../../../StitchErrorCode";
import StitchServiceException from "../../../StitchServiceException";
import CoreAnonymousAuthProviderClient from "../../providers/anonymous/CoreAnonymousAuthProviderClient";
import ProviderTypes from "../../providers/ProviderTypes";
import CoreUserPasswordAuthProviderClient from "../../providers/userpass/CoreUserPasswordAuthProviderClient";
import UserPasswordCredential from "../../providers/userpass/UserPasswordCredential";
import StitchCredential from "../../StitchCredential";
import AccessTokenRefresher from "../AccessTokenRefresher";
import CoreStitchAuth from "../CoreStitchAuth";
import CoreStitchUser from "../CoreStitchUser";
import CoreStitchUserImpl from "../CoreStitchUserImpl";
import APIAuthInfo from "../models/APIAuthInfo";
import StitchUserFactory from "../StitchUserFactory";
import StitchUserProfileImpl from "../StitchUserProfileImpl";

class MockRequestClient extends StitchRequestClient {
  public static readonly APP_ROUTES = new StitchAppRoutes("<app-id>");
  public static readonly USER_ID = "<user_id-hex>";
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

  public static readonly MOCK_EXPIRED_AUTH_INFO = {
    access_token: sign(
      {
        exp: Math.floor(Date.now() / 1000) - 30,
        iat: Math.floor(Date.now() / 1000) - 60
      },
      "shhhhh"
    ),
    device_id: "device_id",
    refresh_token: "refresh_token",
    user_id: MockRequestClient.USER_ID
  };

  public static readonly MOCK_GOOD_AUTH_INFO = {
    access_token: sign(
      {
        exp: Math.floor(Date.now() / 1000) + 400,
        iat: Math.floor(Date.now() / 1000) - 30
      },
      "shhhhh"
    ),
    device_id: "device_id",
    refresh_token: "refresh_token",
    user_id: MockRequestClient.USER_ID
  };

  public static readonly MOCK_SESSION_INFO = {
    access_token: sign(
      {
        exp: Math.floor(Date.now() / 1000) + 400,
        iat: Math.floor(Date.now() / 1000) - 30
      },
      "shhhhh"
    )
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
      body: MockRequestClient.MOCK_GOOD_AUTH_INFO,
      headers: MockRequestClient.BASE_JSON_HEADERS,
      statusCode: 200
    };
  };

  public handleAuthProviderLinkRoute = (request: StitchRequest) => {
    return {
      body: MockRequestClient.MOCK_GOOD_AUTH_INFO,
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

describe("AccessTokenRefresher", () => {
  it("should check refresh", () => {
    const mockRequestClient = new MockRequestClient();

    // swap out login route good data for expired data
    mockRequestClient.handleAuthProviderLoginRoute = (
      request: StitchRequest
    ) => {
      return {
        body: MockRequestClient.MOCK_GOOD_AUTH_INFO,
        headers: MockRequestClient.BASE_JSON_HEADERS,
        statusCode: 200
      };
    };

    const mockCoreAuth = new MockCoreStitchAuth(mockRequestClient);
    const accessTokenRefresher = new AccessTokenRefresher<CoreStitchUserImpl>(
      mockCoreAuth
    );

    return mockCoreAuth
      .loginWithCredential(
        new class extends CoreAnonymousAuthProviderClient {
          constructor() {
            super(ProviderTypes.ANON);
          }
        }().getCredential()
      )
      .then(() => {
        expect(mockCoreAuth.authenticatedRequestFired).toEqual(1);

        return accessTokenRefresher.shouldRefresh();
      })
      .then((shouldRefresh) => {
        // setter should only have been accessed once for login
        expect(shouldRefresh).toEqual(false);

        // swap out login route good data for expired data
        mockRequestClient.handleAuthProviderLoginRoute = (
          request: StitchRequest
        ) => {
          return {
            body: MockRequestClient.MOCK_EXPIRED_AUTH_INFO,
            headers: MockRequestClient.BASE_JSON_HEADERS,
            statusCode: 200
          };
        };

        // logout and relogin. setterAccessor should be accessed twice after this
        return mockCoreAuth.logout();
      })
      .then(() => {
        return mockCoreAuth.loginWithCredential(
          new class extends CoreAnonymousAuthProviderClient {
            constructor() {
              super(ProviderTypes.ANON);
            }
          }().getCredential()
        );
      })
      .then(() => {
        expect(mockCoreAuth.authenticatedRequestFired).toEqual(3);

        // check refresh, which SHOULD trigger a refresh, and the setter
        return accessTokenRefresher.shouldRefresh();
      })
      .then((shouldRefresh) => {
        expect(shouldRefresh).toEqual(true);
      });
  });
});
