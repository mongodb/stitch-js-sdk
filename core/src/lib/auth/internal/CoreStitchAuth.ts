import { Storage } from "../../internal/common/Storage";
import ContentTypes from "../../internal/net/ContentTypes";
import Headers from "../../internal/net/Headers";
import Method from "../../internal/net/Method";
import Response from "../../internal/net/Response";
import StitchAuthDocRequest from "../../internal/net/StitchAuthDocRequest";
import StitchAuthRequest from "../../internal/net/StitchAuthRequest";
import StitchDocRequest from "../../internal/net/StitchDocRequest";
import StitchRequest from "../../internal/net/StitchRequest";
import StitchRequestClient from "../../internal/net/StitchRequestClient";
import StitchClientException from "../../StitchClientException";
import { StitchErrorCode } from "../../StitchErrorCode";
import StitchException from "../../StitchException";
import StitchServiceException from "../../StitchServiceException";
import StitchCredential from "../StitchCredential";
import AccessTokenRefresher from "./AccessTokenRefresher";
import AuthInfo from "./AuthInfo";
import CoreStitchUser from "./CoreStitchUser";
import JWT from "./JWT";
import APIAuthInfo from "./models/APIAuthInfo";
import APICoreUserProfile from "./models/APICoreUserProfile";
import { readFromStorage, writeToStorage } from "./models/StoreAuthInfo";
import StitchAuthRequestClient from "./StitchAuthRequestClient";
import { StitchAuthRoutes } from "./StitchAuthRoutes";
import StitchUserFactory from "./StitchUserFactory";
import StitchUserProfileImpl from "./StitchUserProfileImpl";

const OPTIONS = "options";
const DEVICE = "device";

/**
 * The core class that holds and manages Stitch user authentication state. This class is meant to be inherited.
 *
 * - typeparameters
 *     - TStitchUser: The underlying user type for this `CoreStitchAuth`, which must conform to `CoreStitchUser`.
 */
export default abstract class CoreStitchAuth<TStitchUser extends CoreStitchUser>
  implements StitchAuthRequestClient {
  /**
   * The authentication state, as represented by an `AuthInfo` object.
   */
  public authInfo: AuthInfo;

  /**
   * The `StitchRequestClient` used by the `CoreStitchAuth` to make requests to the Stitch server.
   */
  protected readonly requestClient: StitchRequestClient;
  /**
   * The `StitchAuthRoutes` object representing the authentication API routes
   * of the Stitch server for the current
   * app.
   */
  protected readonly authRoutes: StitchAuthRoutes;
  /**
   * Should return an `StitchUserFactory` object, capable of constructing users of the `TStitchUser` type.
   */
  protected abstract userFactory: StitchUserFactory<TStitchUser>;
  /**
   * A field that should return an object containing information about the current device.
   */
  protected abstract deviceInfo: { [key: string]: string };

  /**
   * The `IStorage` object indicating where authentication information should be persisted.
   */
  private readonly storage: Storage;
  /**
   * A `TStitchUser` object that represents the
   * currently authenticated user, or `undefined` if no one is authenticated.
   */
  private currentUser?: TStitchUser;

  protected constructor(
    requestClient: StitchRequestClient,
    authRoutes: StitchAuthRoutes,
    storage: Storage
  ) {
    this.requestClient = requestClient;
    this.authRoutes = authRoutes;
    this.storage = storage;

    let info: AuthInfo | undefined;
    try {
      info = readFromStorage(storage);
    } catch (e) {
      throw new StitchClientException(e);
    }
    if (info === undefined) {
      this.authInfo = AuthInfo.empty();
    } else {
      this.authInfo = info;
    }

    this.prepUser();

    new AccessTokenRefresher(this).run();
  }

  /**
   * Whether or not a user is currently logged in.
   */
  public get isLoggedIn(): boolean {
    return this.currentUser !== undefined;
  }

  /**
   * The currently authenticated user as a `TStitchUser`, or `undefined` if no user is currently authenticated.
   */
  public get user(): TStitchUser | undefined {
    return this.currentUser;
  }

  /**
   * Performs an authenticated request to the Stitch server, using the current authentication state. Will throw when
   * when the `CoreStitchAuth` is not currently authenticated.
   *
   * - returns: The response to the request as a `Response`.
   */
  public doAuthenticatedRequest(
    stitchReq: StitchAuthRequest
  ): Promise<Response> {
    return this.requestClient
      .doRequest(this.prepareAuthRequest(stitchReq))
      .catch(err => {
        return this.handleAuthFailure(err, stitchReq);
      });
  }

  /**
   * Performs an authenticated request to the Stitch server with a JSON body. Uses the current authentication state,
   * and will throw when the `CoreStitchAuth` is not currently authenticated.
   *
   * - returns: An `any` representing the decoded response body.
   */
  public doAuthenticatedJSONRequest(
    stitchReq: StitchAuthDocRequest
  ): Promise<any> {
    return this.doAuthenticatedJSONRequestRaw(stitchReq)
      .then(response => response.body)
      .catch(err => new StitchClientException(err));
  }

  /**
   * The underlying logic of performing the authenticated JSON request to the Stitch server.
   *
   * - returns: The response to the request as a `Response`.
   */
  public doAuthenticatedJSONRequestRaw(
    stitchReq: StitchAuthDocRequest
  ): Promise<Response> {
    const newReqBuilder = stitchReq.builder;
    newReqBuilder.withBody(stitchReq.document);
    const newHeaders = newReqBuilder.headers; // This is not a copy
    newHeaders[Headers.CONTENT_TYPE] = ContentTypes.APPLICATION_JSON;
    newReqBuilder.withHeaders(newHeaders);

    return this.doAuthenticatedRequest(newReqBuilder.build());
  }

  /**
   * Attempts to refresh the current access token.
   */
  public refreshAccessToken(): Promise<void> {
    const reqBuilder = new StitchAuthRequest.Builder()
      .withRefreshToken()
      .withPath(this.authRoutes.sessionRoute)
      .withMethod(Method.POST);

    return this.doAuthenticatedRequest(reqBuilder.build()).then(response => {
      const partialInfo = APIAuthInfo.readFromAPI(response.body);

      this.authInfo = this.authInfo.merge(partialInfo);

      try {
        writeToStorage(this.authInfo, this.storage);
      } catch (e) {
        throw new StitchClientException(e);
      }
    });
  }

  protected abstract onAuthEvent();

  /**
   * Authenticates the `CoreStitchAuth` using the provided `StitchCredential`. Blocks the current thread until the
   * request is completed.
   */
  protected loginWithCredential(
    credential: StitchCredential
  ): Promise<TStitchUser> {
    if (!this.isLoggedIn) {
      return this.doLogin(credential, false);
    }

    if (credential.providerCapabilities.reusesExistingSession) {
      if (credential.providerType === this.currentUser!.loggedInProviderType) {
        return Promise.resolve(this.currentUser!);
      }
    }

    this.logout();
    return this.doLogin(credential, false);
  }

  /**
   * Links the currently logged in user with a new identity represented by the provided `StitchCredential`. Blocks the
   * current thread until the request is completed.
   */
  protected linkUserWithCredential(
    user: CoreStitchUser,
    credential: StitchCredential
  ): Promise<TStitchUser> {
    if (this.currentUser !== undefined && user.id !== this.currentUser.id) {
      return Promise.reject(
        "user no longer valid; please try again with a new user from StitchAuth.getUser()"
      );
    }

    return this.doLogin(credential, true);
  }

  /**
   * Logs out the current user, and clears authentication state from this `CoreStitchAuth` as well as underlying
   * storage. Blocks the current thread until the request is completed. If the logout request fails, this method will
   * still attempt to clear local authentication state. This method will only throw if clearing authentication state
   * fails.
   */
  protected logout() {
    if (!this.isLoggedIn) {
      return;
    }
    try {
      this.doLogout();
    } catch (ex) {
      // Do nothing
    } finally {
      this.clearAuth();
    }
  }

  /**
   * Returns whether or not the current authentication state has a meaningful device id.
   */
  protected get hasDeviceId(): boolean {
    return (
      this.authInfo.deviceId !== undefined &&
      this.authInfo.deviceId !== "" &&
      this.authInfo.deviceId !== "000000000000000000000000"
    );
  }

  /**
   * Returns the currently authenticated user's device id, or `undefined` is no user is currently authenticated, or if the
   * device id does not exist.
   */
  protected get deviceId(): string | undefined {
    if (!this.hasDeviceId) {
      return undefined;
    }

    return this.authInfo.deviceId;
  }

  /**
   * Prepares an authenticated Stitch request by attaching the `CoreStitchAuth`'s current access or refresh token
   * (depending on the type of request) to the request's `"Authorization"` header.
   */
  private prepareAuthRequest(stitchReq: StitchAuthRequest): StitchRequest {
    if (!this.isLoggedIn) {
      throw new StitchClientException("must authenticate first");
    }

    const newReq = stitchReq.builder;
    const newHeaders = newReq.headers; // This is not a copy
    if (stitchReq.useRefreshToken) {
      newHeaders[Headers.AUTHORIZATION] = Headers.getAuthorizationBearer(
        this.authInfo.refreshToken!
      );
    } else {
      newHeaders[Headers.AUTHORIZATION] = Headers.getAuthorizationBearer(
        this.authInfo.accessToken!
      );
    }
    newReq.withHeaders(newHeaders);
    return newReq.build();
  }

  /**
   * Checks the `StitchServiceException` object provided in the `forError` parameter, and if it's an error indicating an invalid
   * Stitch session, it will handle the error by attempting to refresh the access token if it hasn't been attempted
   * already. If the error is not a Stitch error, or the error is a Stitch error not related to an invalid session,
   * it will be re-thrown.
   */
  private handleAuthFailure(
    ex: StitchException,
    req: StitchAuthRequest
  ): Promise<Response> {
    if (
      !(ex instanceof StitchServiceException) ||
      ex.errorCode !== StitchErrorCode.INVALID_SESSION
    ) {
      throw ex;
    }

    // using a refresh token implies we cannot refresh anything, so clear auth and
    // notify
    if (req.useRefreshToken) {
      this.clearAuth();
      throw ex;
    }

    this.tryRefreshAccessToken(req.startedAt);

    return this.doAuthenticatedRequest(req);
  }

  /**
   * Checks if the current access token is expired or going to expire soon, and refreshes the access token if
   * necessary.
   */
  private tryRefreshAccessToken(reqStartedAt: number) {
    // use this critical section to create a queue of pending outbound requests
    // that should wait on the result of doing a token refresh or logout. This will
    // prevent too many refreshes happening one after the other.
    if (!this.isLoggedIn) {
      throw new StitchClientException("logged out during request");
    }

    try {
      const jwt = JWT.fromEncoded(this.authInfo.accessToken!);
      if (jwt.issuedAt >= reqStartedAt) {
        return;
      }
    } catch (e) {
      // Swallow
    }

    // retry
    try {
      this.refreshAccessToken();
    } catch (e) {
      throw new StitchClientException(e);
    }
  }

  private prepUser() {
    if (this.authInfo.userId !== undefined) {
      // this implies other properties we are interested should be set
      this.currentUser = this.userFactory.makeUser(
        this.authInfo.userId,
        this.authInfo.loggedInProviderType!,
        this.authInfo.loggedInProviderName!,
        this.authInfo.userProfile
      );
    }
  }

  /**
   * Attaches authentication options to the BSON document passed in as the `authBody` parameter. Necessary for the
   * the login request.
   */
  private attachAuthOptions(authBody: object) {
    const options = {};
    options[DEVICE] = this.deviceInfo;
    authBody[OPTIONS] = options;
  }

  /**
   * Performs the logic of logging in this `CoreStitchAuth` as a new user with the provided credential. Can also
   * perform a user link if the `asLinkRequest` parameter is true.
   */
  private doLogin(
    credential: StitchCredential,
    asLinkRequest: boolean
  ): Promise<TStitchUser> {
    return this.doLoginRequest(credential, asLinkRequest)
      .then(response => this.processLoginResponse(credential, response))
      .then(user => {
        this.onAuthEvent();
        return user;
      });
  }

  /**
   * Performs the login request against the Stitch server. If `asLinkRequest` is true, a link request is performed
   * instead.
   */
  private doLoginRequest(
    credential: StitchCredential,
    asLinkRequest: boolean
  ): Promise<Response> {
    const reqBuilder = new StitchDocRequest.Builder();
    reqBuilder.withMethod(Method.POST);

    if (asLinkRequest) {
      reqBuilder.withPath(
        this.authRoutes.getAuthProviderLinkRoute(credential.providerName)
      );
    } else {
      reqBuilder.withPath(
        this.authRoutes.getAuthProviderLoginRoute(credential.providerName)
      );
    }

    const material = credential.material;
    this.attachAuthOptions(material);
    reqBuilder.withDocument(material);

    if (!asLinkRequest) {
      return this.requestClient.doJSONRequestRaw(reqBuilder.build());
    }
    const linkRequest = new StitchAuthDocRequest(
      reqBuilder.build(),
      reqBuilder.document
    );
    return this.doAuthenticatedJSONRequestRaw(linkRequest);
  }

  /**
   * Processes the response of the login/link request, setting the authentication state if appropriate, and
   * requesting the user profile in a separate request.
   */
  private processLoginResponse(
    credential: StitchCredential,
    response: Response
  ): Promise<TStitchUser> {
    let newAuthInfo: APIAuthInfo;
    try {
      newAuthInfo = APIAuthInfo.readFromAPI(response.body);
    } catch (e) {
      throw new StitchClientException(e);
    }

    newAuthInfo = this.authInfo.merge(
      new AuthInfo(
        newAuthInfo.userId,
        newAuthInfo.deviceId,
        newAuthInfo.accessToken,
        newAuthInfo.refreshToken,
        credential.providerType,
        credential.providerName,
        undefined
      )
    );

    // Provisionally set so we can make a profile request
    const oldInfo = this.authInfo;
    this.authInfo = newAuthInfo;
    this.currentUser = this.userFactory.makeUser(
      this.authInfo.userId!,
      credential.providerType,
      credential.providerName,
      undefined
    );

    return this.doGetUserProfile()
      .then(profile => {
        // readonlyly set the info and user
        newAuthInfo = newAuthInfo.merge(
          new AuthInfo(
            newAuthInfo.userId,
            newAuthInfo.deviceId,
            newAuthInfo.accessToken,
            newAuthInfo.refreshToken,
            credential.providerType,
            credential.providerName,
            profile
          )
        );

        try {
          writeToStorage(newAuthInfo, this.storage);
        } catch (e) {
          throw new StitchClientException(e);
        }

        this.authInfo = newAuthInfo;
        this.currentUser = this.userFactory.makeUser(
          this.authInfo.userId!,
          credential.providerType,
          credential.providerName,
          profile
        );

        return this.currentUser;
      })
      .catch(err => {
        this.authInfo = oldInfo;
        this.currentUser = undefined;
        throw err;
      });
  }

  /**
   * Performs a request against the Stitch server to get the currently authenticated user's profile.
   */
  private doGetUserProfile(): Promise<StitchUserProfileImpl> {
    const reqBuilder = new StitchAuthRequest.Builder();
    reqBuilder.withMethod(Method.GET).withPath(this.authRoutes.profileRoute);

    return this.doAuthenticatedRequest(reqBuilder.build())
      .then(response => APICoreUserProfile.decodeFrom(response.body))
      .catch(err => {
        throw new StitchClientException(err);
      });
  }

  /**
   * Performs a logout request against the Stitch server.
   */
  private doLogout(): Promise<void> {
    const reqBuilder = new StitchAuthRequest.Builder();
    reqBuilder
      .withRefreshToken()
      .withPath(this.authRoutes.sessionRoute)
      .withMethod(Method.DELETE);
    return this.doAuthenticatedRequest(reqBuilder.build()).then(() => { return; });
  }

  /**
   * Clears the `CoreStitchAuth`'s authentication state, as well as associated authentication state in underlying
   * storage.
   */
  private clearAuth() {
    if (!this.isLoggedIn) {
      return;
    }
    this.authInfo = this.authInfo.loggedOut();
    try {
      writeToStorage(this.authInfo, this.storage);
    } catch (e) {
      throw new StitchClientException(e);
    }
    this.currentUser = undefined;
    this.onAuthEvent();
  }
}
