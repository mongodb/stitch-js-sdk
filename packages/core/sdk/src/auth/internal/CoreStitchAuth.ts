/**
 * Copyright 2018-present MongoDB, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { EJSON } from "bson";
import { Codec, Decoder } from "../../internal/common/Codec";
import { wrapDecodingError } from "../../internal/common/StitchErrorUtils";
import { Storage } from "../../internal/common/Storage";
import ContentTypes from "../../internal/net/ContentTypes";
import EventStream from "../../internal/net/EventStream";
import Headers from "../../internal/net/Headers";
import Method from "../../internal/net/Method";
import Response from "../../internal/net/Response";
import { StitchAuthDocRequest } from "../../internal/net/StitchAuthDocRequest";
import { StitchAuthRequest } from "../../internal/net/StitchAuthRequest";
import { StitchDocRequest } from "../../internal/net/StitchDocRequest";
import { StitchRequest } from "../../internal/net/StitchRequest";
import StitchRequestClient from "../../internal/net/StitchRequestClient";
import StitchClientError from "../../StitchClientError";
import { StitchClientErrorCode } from "../../StitchClientErrorCode";
import StitchError from "../../StitchError";
import StitchRequestError from "../../StitchRequestError";
import { StitchRequestErrorCode } from "../../StitchRequestErrorCode";
import StitchServiceError from "../../StitchServiceError";
import { StitchServiceErrorCode } from "../../StitchServiceErrorCode";
import Stream from "../../Stream";
import AnonymousAuthProvider from "../providers/anonymous/AnonymousAuthProvider";
import StitchAuthResponseCredential from "../providers/internal/StitchAuthResponseCredential";
import StitchCredential from "../StitchCredential";
import AccessTokenRefresher from "./AccessTokenRefresher";
import { AuthEvent, AuthEventKind } from "./AuthEvent";
import AuthInfo from "./AuthInfo";
import CoreStitchUser from "./CoreStitchUser";
import JWT from "./JWT";
import ApiAuthInfo from "./models/ApiAuthInfo";
import ApiCoreUserProfile from "./models/ApiCoreUserProfile";
import { readActiveUserFromStorage, readCurrentUsersFromStorage, StoreAuthInfo, writeActiveUserAuthInfoToStorage, writeAllUsersAuthInfoToStorage } from "./models/StoreAuthInfo";
import StitchAuthRequestClient from "./StitchAuthRequestClient";
import { StitchAuthRoutes } from "./StitchAuthRoutes";
import StitchUserFactory from "./StitchUserFactory";
import StitchUserProfileImpl from "./StitchUserProfileImpl";

const OPTIONS = "options";
const DEVICE = "device";

/**
 * @hidden
 * The core class that holds and manages Stitch user authentication state. This class is meant to be inherited.
 *
 * - typeparameters
 *     - TStitchUser: The underlying user type for this `CoreStitchAuth`, which must conform to `CoreStitchUser`.
 */
export default abstract class CoreStitchAuth<TStitchUser extends CoreStitchUser>
  implements StitchAuthRequestClient {

  /**
   * The authentication information of the active user, as represented by an 
   * `AuthInfo` object.
   */
  public get authInfo(): AuthInfo {
    return this.activeUserAuthInfo;
  }

  /**
   * Whether or not a user is currently logged in.
   */
  public get isLoggedIn(): boolean {
    return this.currentUser !== undefined && this.currentUser.isLoggedIn;
  }

  /**
   * The currently authenticated user as a `TStitchUser`, or `undefined` if no user is currently authenticated.
   */
  public get user(): TStitchUser | undefined {
    return this.currentUser;
  }

  /**
   * Returns whether or not the current authentication state has a meaningful device id.
   */
  public get hasDeviceId(): boolean {
    return (
      this.activeUserAuthInfo.deviceId !== undefined &&
      this.activeUserAuthInfo.deviceId !== "" &&
      this.activeUserAuthInfo.deviceId !== "000000000000000000000000"
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

    return this.activeUserAuthInfo.deviceId;
  }

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

  private activeUserAuthInfo: AuthInfo

  /**
   * The `IStorage` object indicating where authentication information should be persisted.
   */
  private readonly storage: Storage;
  /**
   * A `TStitchUser` object that represents the currently authenticated active 
   * user, or `undefined` if there is no active user.
   */
  private currentUser?: TStitchUser;

  /**
   * An ordered dictionary of all of the cached users associated with this 
   * application keyed by Stitch user ID, some of whom may be logged in.
   */
  private allUsersAuthInfo: Map<string, AuthInfo>

  private readonly accessTokenRefresher: AccessTokenRefresher<TStitchUser>;

  protected constructor(
    requestClient: StitchRequestClient,
    authRoutes: StitchAuthRoutes,
    storage: Storage,
    useTokenRefresher = true
  ) {
    this.requestClient = requestClient;
    this.authRoutes = authRoutes;
    this.storage = storage;

    let allUsersAuthInfo: Map<string, AuthInfo>;
    try {
      allUsersAuthInfo = readCurrentUsersFromStorage(storage);
    } catch(e) {
      throw new StitchClientError(
        StitchClientErrorCode.CouldNotLoadPersistedAuthInfo
      );
    }
    this.allUsersAuthInfo = allUsersAuthInfo;

    let activeUserAuthInfo: AuthInfo | undefined;
    try {
      activeUserAuthInfo = readActiveUserFromStorage(storage);
    } catch (e) {
      throw new StitchClientError(
        StitchClientErrorCode.CouldNotLoadPersistedAuthInfo
      );
    }
    this.activeUserAuthInfo = 
         activeUserAuthInfo === undefined ? AuthInfo.empty() : activeUserAuthInfo;

    if (this.activeUserAuthInfo.hasUser) {
      this.currentUser = this.prepUser(this.activeUserAuthInfo);
    }

    if (useTokenRefresher) {
      this.accessTokenRefresher = new AccessTokenRefresher(this);
      this.accessTokenRefresher.run();
    }
  }

  public listUsers(): TStitchUser[] {
    const list: TStitchUser[] = [];
  
    this.allUsersAuthInfo.forEach(authInfo => {
      list.push(this.prepUser(authInfo));
    });

    return list;
  }

  /**
   * Performs an authenticated request to the Stitch server, using the current 
   * authentication state of the active user, or the AuthInfo provided if one 
   * is provided. Will throw when when the active user or provided user auth 
   * info is not currently logged in.
   *
   * - returns: The response to the request as a `Response`.
   */
  public doAuthenticatedRequest(
    stitchReq: StitchAuthRequest,
    authInfo?: AuthInfo | undefined
  ): Promise<Response> {
    return this.requestClient
      .doRequest(this.prepareAuthRequest(stitchReq, authInfo || this.activeUserAuthInfo))
      .catch(err =>
        this.handleAuthFailure(err, stitchReq));
  }

  /**
   * Performs an authenticated request to the Stitch server with a JSON body, and decodes the extended JSON response into
   * an object. Uses the current authentication state, and will throw when the `CoreStitchAuth` is not currently authenticated.
   *
   * - returns: An `any` representing the decoded response body.
   */
  public doAuthenticatedRequestWithDecoder<T>(
    stitchReq: StitchAuthRequest,
    decoder?: Decoder<T>
  ): Promise<T> {
    return this.doAuthenticatedRequest(stitchReq)
      .then(response => {       
        const obj = EJSON.parse(response.body!, { strict: false });

        if (decoder) {
          return decoder.decode(obj);
        }

        return obj;
      })
      .catch(err => {
        throw wrapDecodingError(err);
      });
  }

  public openAuthenticatedEventStream(
    stitchReq: StitchAuthRequest,
    open = true
  ): Promise<EventStream> {
    if (!this.isLoggedIn) {
      throw new StitchClientError(StitchClientErrorCode.MustAuthenticateFirst);
    }

    const authToken = stitchReq.useRefreshToken ? 
          this.activeUserAuthInfo.refreshToken! : this.activeUserAuthInfo.accessToken!;


    return this.requestClient.doStreamRequest(
      stitchReq.builder
      .withPath(`${stitchReq.path}&stitch_at=${authToken}`)
      .build(),
      open,
      () => this.openAuthenticatedEventStream(stitchReq, false))
    .catch(err =>
      this.handleAuthFailureForEventStream(err, stitchReq, open));
  }

  public openAuthenticatedStreamWithDecoder<T>(
    stitchReq: StitchAuthRequest,
    decoder?: Decoder<T>
  ): Promise<Stream<T>> {
    return this.openAuthenticatedEventStream(stitchReq)
    .then(eventStream =>
      new Stream<T>(eventStream, decoder));
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
      try {
        const partialInfo = ApiAuthInfo.fromJSON(JSON.parse(response.body!));
        this.activeUserAuthInfo = this.activeUserAuthInfo.merge(partialInfo);
      } catch (err) {
        throw new StitchRequestError(
          err,
          StitchRequestErrorCode.DECODING_ERROR
        );
      }

      try {
        writeActiveUserAuthInfoToStorage(this.activeUserAuthInfo, this.storage);

        this.allUsersAuthInfo.set(
          this.activeUserAuthInfo.userId!, 
          this.activeUserAuthInfo
        );
        writeAllUsersAuthInfoToStorage(this.allUsersAuthInfo, this.storage);
      } catch (err) {
        throw new StitchClientError(
          StitchClientErrorCode.CouldNotPersistAuthInfo
        );
      }
    });
  }

  /**
   * Changes the active user of this [[CoreStitchAuth]] to be the user with
   * the specified id. The user must have logged in on this client at least 
   * once, and the user must not have been removed from the list of users
   * with a call to [[removeUser]]. Use [[listUsers]] to get a list of the 
   * users that can be switched to.
   * 
   * @param userId The id of the user to switch to
   * @throws [[StitchClientError.UserNotFound]] if the user was not found,
   *         [[StitchClientError.UserNotLoggedIn]] if the user is logged out.
   */
  public switchToUserWithId(userId: string): TStitchUser {
    const authInfo = this.allUsersAuthInfo.get(userId);
    if (authInfo === undefined) {
      throw new StitchClientError(StitchClientErrorCode.UserNotFound);
    }
    if (!authInfo.isLoggedIn) {
      throw new StitchClientError(
        StitchClientErrorCode.UserNotLoggedIn
      );
    }

    // Update the previous activeUserAuthInfo's lastAuthActivity if there was 
    // A previous active user.
    if (this.activeUserAuthInfo.hasUser) {
      this.allUsersAuthInfo.set(
        this.activeUserAuthInfo.userId!, 
        this.activeUserAuthInfo.withNewAuthActivityTime()
      );
    }
    const newAuthInfo = authInfo.withNewAuthActivityTime();
    this.allUsersAuthInfo.set(
      userId,
      newAuthInfo
    );


    // Persist auth info storage before actually setting auth state so that
    // If the persist call throws, we are not in an inconsistent state
    // With storage
    writeActiveUserAuthInfoToStorage(newAuthInfo, this.storage)

    // Set the active user auth info and active user to the user with ID as 
    // Specified in the list of all users.
    this.activeUserAuthInfo = newAuthInfo;

    const previousUser = this.currentUser;
    this.currentUser = this.prepUser(newAuthInfo);

    // Dispatch an ActiveUserChangedEvent indicating to listeners that the 
    // Active user was switched from one user to another.
    this.onAuthEvent(); // Legacy event dispatch
    this.dispatchAuthEvent({
      currentActiveUser: this.currentUser,
      kind: AuthEventKind.ActiveUserChanged,
      previousActiveUser: previousUser
    });

    return this.currentUser;
  }

  /**
   * Authenticates the `CoreStitchAuth` using the provided `StitchCredential`. Blocks the current thread until the
   * request is completed.
   */
  public loginWithCredentialInternal(
    credential: StitchCredential
  ): Promise<TStitchUser> {
    if (credential instanceof StitchAuthResponseCredential) {
      return this.processLogin(credential, credential.authInfo, credential.asLink);
    }

    /*
     * if we are logging in with a credential that reuses existing sessions
     * (e.g. the anonymous credential), check to see if any users are already
     * logged in with that credential.
     */
    if (credential.providerCapabilities.reusesExistingSession) {
      for (const [userId, authInfo] of this.allUsersAuthInfo) {
        if (authInfo.loggedInProviderType === credential.providerType) {
          return Promise.resolve(this.switchToUserWithId(userId));
        }
      }
    }

    return this.doLogin(credential, false);
  }

  /**
   * Links the currently logged in user with a new identity represented by the 
   * provided `StitchCredential`.
   */
  public linkUserWithCredentialInternal(
    user: CoreStitchUser,
    credential: StitchCredential
  ): Promise<TStitchUser> {
    if (this.currentUser !== undefined && user.id !== this.currentUser.id) {
      return Promise.reject(
        new StitchClientError(StitchClientErrorCode.UserNoLongerValid)
      );
    }

    return this.doLogin(credential, true);
  }

  /**
   * Logs out the current user, and clears authentication state from this `CoreStitchAuth` as well as underlying
   * storage. If the logout request fails, this method will
   * still attempt to clear local authentication state. This method will only throw if clearing authentication state
   * fails.
   */
  public logoutInternal(): Promise<void> {
    if (!this.isLoggedIn || !this.currentUser) {
      return Promise.resolve();
    }

    return this.logoutUserWithIdInternal(this.currentUser.id);
  }

  public logoutUserWithIdInternal(userId: string): Promise<void> {
    const authInfo = this.allUsersAuthInfo.get(userId);
    if (authInfo === undefined) {
      return Promise.reject(
        new StitchClientError(StitchClientErrorCode.UserNotFound)
      );
    }

    if (!authInfo.isLoggedIn) {
      return Promise.resolve();
    }

    const clearAuthBlock = () => {
      this.clearUserAuthTokens(authInfo.userId!);

      /**
       * Note: the UserLoggedOut event is not dispatched here. It is dispatched
       * in the [[clearUserAuthTokens]] method, where there is more context 
       * about the user being logged out and whether that user was the active
       * user.
       */

      // If the user was anonymous, delete the user, since you can't log back
      // In to an anonymous user after they have logged out.
      if (authInfo.loggedInProviderType === AnonymousAuthProvider.TYPE) {
        this.removeUserWithIdInternal(authInfo.userId!);
      }
    }

    /*
     * Promise.finally needs to be added as a shim
     * to TS. Until we need another .finally, we
     * will need this workaround for cleanup
     */
    return this.doLogout(authInfo)
      .then(() => {
        clearAuthBlock();
      })
      .catch(() => {
        clearAuthBlock();
      });
  }

  /**
   * Removes the active user.
   */
  public removeUserInternal(): Promise<void> {
    if (!this.isLoggedIn || this.currentUser === undefined) {
      return Promise.resolve();
    }

    return this.removeUserWithIdInternal(this.currentUser.id);
  }

  /**
   * Removes the user with the specified ID from the list of all users.
   * @param userId the id of the user to remove
   */
  public removeUserWithIdInternal(userId: string): Promise<void> {
    const authInfo = this.allUsersAuthInfo.get(userId);

    if (authInfo === undefined) {
      return Promise.reject(
        new StitchClientError(StitchClientErrorCode.UserNotFound)
      );
    }

    const removeBlock = () => {
      this.clearUserAuthTokens(authInfo.userId!);
      this.allUsersAuthInfo.delete(userId);
      writeAllUsersAuthInfoToStorage(this.allUsersAuthInfo, this.storage);

      const removedUser = this.prepUser(authInfo.loggedOut());

      // Dispatch an event indicating that a user was removed.
      this.onAuthEvent();
      this.dispatchAuthEvent({
        kind: AuthEventKind.UserRemoved,
        removedUser
      });
    }
    
    if (authInfo.isLoggedIn) {
      return this.doLogout(authInfo).then(() => {
        removeBlock();
      }).catch(err => {
        removeBlock();
      })
    }

    // If the user being removed isn't logged in, just clear that user's auth
    // And update the list of all users.
    removeBlock()
    return Promise.resolve();
  }

  /**
   * Close stops any background processes maintained by auth. This
   * should be called when auth services are no longer needed.
   */
  public close() {
    if (this.accessTokenRefresher) {
      this.accessTokenRefresher.stop();
    }
  }

  /**
   * Abstract declaration of the method to be implemented by platform-specific
   * SDKs to dispatch events to the deprecated "onAuthEvent" method in the
   * StitchAuthListener.
   */
  protected abstract onAuthEvent();

  /**
   * Abstract declaration of the method to be implemented by platform-specific
   * SDKs to dispatch events to the new event methods in the StitchAuthListener.
   */
  protected abstract dispatchAuthEvent(event: AuthEvent<TStitchUser>);

  /**
   * Prepares an authenticated Stitch request by attaching the `CoreStitchAuth`'s current access or refresh token
   * (depending on the type of request) to the request's `"Authorization"` header.
   */
  private prepareAuthRequest(
    stitchReq: StitchAuthRequest,
    authInfo: AuthInfo
  ): StitchRequest {
    if (!authInfo.isLoggedIn) {
      throw new StitchClientError(StitchClientErrorCode.MustAuthenticateFirst);
    }

    const newReq = stitchReq.builder;
    const newHeaders = newReq.headers || {}; // This is not a copy

    if (stitchReq.useRefreshToken) {
      newHeaders[Headers.AUTHORIZATION] = Headers.getAuthorizationBearer(
        authInfo.refreshToken!
      );
    } else {
      newHeaders[Headers.AUTHORIZATION] = Headers.getAuthorizationBearer(
        authInfo.accessToken!
      );
    }
    newReq.withHeaders(newHeaders);
    return newReq.build();
  }

  private handleAuthFailureForEventStream(
    ex: StitchError,
    req: StitchAuthRequest,
    open = true
  ): Promise<EventStream> {
    if (
      !(ex instanceof StitchServiceError) ||
      ex.errorCode !== StitchServiceErrorCode.InvalidSession
    ) {
      throw ex;
    }

    // Using a refresh token implies we cannot refresh anything, 
    // So clear auth and notify
    if (req.useRefreshToken || !req.shouldRefreshOnFailure) {
      this.clearActiveUserAuth();
      throw ex;
    }

    return this.tryRefreshAccessToken(req.startedAt).then(() =>
      this.openAuthenticatedEventStream(
        req.builder.withShouldRefreshOnFailure(false).build(),
        open
      ));
  }

  /**
   * Checks the `StitchServiceError` object provided in the `forError` parameter, and if it's an error indicating an invalid
   * Stitch session, it will handle the error by attempting to refresh the access token if it hasn't been attempted
   * already. If the error is not a Stitch error, or the error is a Stitch error not related to an invalid session,
   * it will be re-thrown.
   */
  private handleAuthFailure(
    ex: StitchError,
    req: StitchAuthRequest
  ): Promise<Response> {
    if (
      !(ex instanceof StitchServiceError) ||
      ex.errorCode !== StitchServiceErrorCode.InvalidSession
    ) {
      throw ex;
    }

    // Using a refresh token implies we cannot refresh anything, 
    // So clear auth and notify
    if (req.useRefreshToken || !req.shouldRefreshOnFailure) {
      this.clearActiveUserAuth();
      throw ex;
    }

    return this.tryRefreshAccessToken(req.startedAt).then(() =>
      this.doAuthenticatedRequest(
        req.builder.withShouldRefreshOnFailure(false).build()
      ));
  }

  /**
   * Checks if the current access token is expired or going to expire soon, and refreshes the access token if
   * necessary.
   */
  private tryRefreshAccessToken(reqStartedAt: number): Promise<void> {
    /*
     * Use this critical section to create a queue of pending outbound requests
     * that should wait on the result of doing a token refresh or logout. This will
     * prevent too many refreshes happening one after the other.
     */
    if (!this.isLoggedIn) {
      throw new StitchClientError(StitchClientErrorCode.LoggedOutDuringRequest);
    }

    try {
      const jwt = JWT.fromEncoded(this.activeUserAuthInfo.accessToken!);
      if (jwt.issuedAt >= reqStartedAt) {
        return Promise.resolve();
      }
    } catch (e) {
      // Swallow
    }

    // Retry
    return this.refreshAccessToken();
  }

  private prepUser(authInfo: AuthInfo): TStitchUser {
    return this.userFactory.makeUser(
      authInfo.userId!,
      authInfo.loggedInProviderType!,
      authInfo.loggedInProviderName!,
      authInfo.isLoggedIn,
      authInfo.lastAuthActivity!,
      authInfo.userProfile
    );
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
    const previousActiveUser = this.currentUser;
    return this.doLoginRequest(credential, asLinkRequest)
      .then(response => this.processLoginResponse(credential, response, asLinkRequest))
      .then(user => {
        this.onAuthEvent(); // Legacy event dispatch

        // Dispatch the appropriate auth events
        // For the type of login that occured.
        if (asLinkRequest) {
          this.dispatchAuthEvent({
            kind: AuthEventKind.UserLinked,
            linkedUser: user
          });
        } else {
          // This triggers an event for the user logging in, as well as the 
          // Active user changing.
          this.dispatchAuthEvent({
            kind: AuthEventKind.UserLoggedIn,
            loggedInUser: user,
          });
          this.dispatchAuthEvent({
            currentActiveUser: user,
            kind: AuthEventKind.ActiveUserChanged,
            previousActiveUser
          });
        }
        
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
      return this.requestClient.doRequest(reqBuilder.build());
    }
    const linkRequest = new StitchAuthDocRequest(
      reqBuilder.build(),
      reqBuilder.document
    );

    return this.doAuthenticatedRequest(linkRequest);
  }

  /**
   * Processes the authentication info from the login/link request, setting the authentication state, and
   * requesting the user profile in a separate request.
   */
  private processLogin(
    credential: StitchCredential,
    newAuthInfo: AuthInfo,
    asLinkRequest: boolean
  ): Promise<TStitchUser> {

    // Preserve old auth info in case of profile request failure
    const oldActiveUserInfo = this.activeUserAuthInfo;
    const oldActiveUser = this.currentUser;

    newAuthInfo = this.activeUserAuthInfo.merge(
      new AuthInfo(
        newAuthInfo.userId,
        newAuthInfo.deviceId,
        newAuthInfo.accessToken,
        newAuthInfo.refreshToken,
        credential.providerType,
        credential.providerName,
        undefined,
        undefined
      )
    );

    // Provisionally set so we can make a profile request
    this.activeUserAuthInfo = newAuthInfo;
    this.currentUser = this.userFactory.makeUser(
      this.activeUserAuthInfo.userId!,
      credential.providerType,
      credential.providerName,
      this.activeUserAuthInfo.isLoggedIn,
      new Date(),
      undefined
    );

    return this.doGetUserProfile()
      .then(profile => {

        // Update the old user's auth activity if there was one
        if (oldActiveUserInfo.hasUser) {
          this.allUsersAuthInfo.set(
            oldActiveUserInfo.userId!, 
            oldActiveUserInfo.withNewAuthActivityTime()
          );
        }

        // Finally set the info and user
        newAuthInfo = newAuthInfo.merge(
          new AuthInfo(
            newAuthInfo.userId,
            newAuthInfo.deviceId,
            newAuthInfo.accessToken,
            newAuthInfo.refreshToken,
            credential.providerType,
            credential.providerName,
            new Date(),
            profile
          )
        );

        const newUserAdded = !this.allUsersAuthInfo.has(newAuthInfo.userId!);

        try {
          writeActiveUserAuthInfoToStorage(newAuthInfo, this.storage);

          /*
           * this replaces any old info that may have 
           * existed for this user if this was a link request, or if this 
           * user already existed in the list of all users
           */
          this.allUsersAuthInfo.set(newAuthInfo.userId!, newAuthInfo);  
      
          writeAllUsersAuthInfoToStorage(this.allUsersAuthInfo, this.storage);
        } catch (err) {
          // Back out of setting authInfo with this new user
          this.activeUserAuthInfo = oldActiveUserInfo;
          this.currentUser = oldActiveUser;
          
          // Delete the new partial auth info from the list of all users if
          // The new auth info is not the same user
          if (newAuthInfo.userId !== oldActiveUserInfo.userId && newAuthInfo.userId) {
            this.allUsersAuthInfo.delete(newAuthInfo.userId);
          }
          
          throw new StitchClientError(
            StitchClientErrorCode.CouldNotPersistAuthInfo
          );
        }
        
        // Set the active user info to the new 
        // Auth info and new user with profile
        this.activeUserAuthInfo = newAuthInfo;
        this.currentUser = this.userFactory.makeUser(
          this.activeUserAuthInfo.userId!,
          credential.providerType,
          credential.providerName,
          this.activeUserAuthInfo.isLoggedIn,
          this.activeUserAuthInfo.lastAuthActivity!,
          profile
        );

        // Dispatch a UserAdded event if this is the first time this user is 
        // Being added to the list of users on the device.
        if (newUserAdded) {
          this.onAuthEvent() // Tegacy event dispatch

          this.dispatchAuthEvent({
            addedUser: this.currentUser,
            kind: AuthEventKind.UserAdded
          });
        }

        return this.currentUser;
      })
      .catch(err => {
        // Propagate persistence errors
        if (err instanceof StitchClientError) {
          throw err;
        }

        /*
         * If this was a link request or there was an active user logged in,
         * back out of setting authInfo and reset any created user. This
         *  will keep the currently logged in user logged in if the profile
         *  request failed, and in this particular edge case the user is
         * linked, but they are logged in with their older credentials.
         */
        if (asLinkRequest || oldActiveUserInfo.hasUser) {
          const linkedAuthInfo = this.activeUserAuthInfo;
          this.activeUserAuthInfo = oldActiveUserInfo;
          this.currentUser = oldActiveUser; 

          /* 
           * To prevent the case where this user gets removed when logged out 
           * in the future because the original provider type was anonymous, 
           * make sure the auth info reflects the new logged in provider type 
           */
          if (asLinkRequest) {
            this.activeUserAuthInfo = this.activeUserAuthInfo.withAuthProvider(
              linkedAuthInfo.loggedInProviderType!,
              linkedAuthInfo.loggedInProviderName!
            );
          }
        } else { // Otherwise this was a normal login request, so log the user out
          this.clearActiveUserAuth();
        }

        throw err;
      });
  }

  /**
   * Processes the response of the login/link request, setting the authentication state if appropriate, and
   * requesting the user profile in a separate request.
   */
  private processLoginResponse(
    credential: StitchCredential,
    response: Response,
    asLinkRequest: boolean
  ): Promise<TStitchUser> {
    try {
      if (!response) {
        throw new StitchServiceError(
          `the login response could not be processed for credential: ${credential};` +
            `response was undefined`
        );
      }
      if (!response.body) {
        throw new StitchServiceError(
          `response with status code ${response.statusCode} has empty body`
        );
      }
      return this.processLogin(
        credential,
        ApiAuthInfo.fromJSON(JSON.parse(response.body!)),
        asLinkRequest
      );
    } catch (err) {
      throw new StitchRequestError(err, StitchRequestErrorCode.DECODING_ERROR);
    }
  }

  /**
   * Performs a request against the Stitch server to get the currently authenticated user's profile.
   */
  private doGetUserProfile(): Promise<StitchUserProfileImpl> {
    const reqBuilder = new StitchAuthRequest.Builder();
    reqBuilder.withMethod(Method.GET).withPath(this.authRoutes.profileRoute);

    return this.doAuthenticatedRequest(reqBuilder.build())
      .then(response => ApiCoreUserProfile.fromJSON(JSON.parse(response.body!)))
      .catch(err => {
        if (err instanceof StitchError) {
          throw err;
        } else {
          throw new StitchRequestError(
            err,
            StitchRequestErrorCode.DECODING_ERROR
          );
        }
      });
  }

  /**
   * Performs a logout request against the Stitch server.
   */
  private doLogout(authInfo: AuthInfo): Promise<void> {
    const reqBuilder = new StitchAuthRequest.Builder();
    reqBuilder
      .withRefreshToken()
      .withPath(this.authRoutes.sessionRoute)
      .withMethod(Method.DELETE);
    return this.doAuthenticatedRequest(reqBuilder.build(), authInfo).then(() => {
      return;
    });
  }

  /**
   * Clears the `CoreStitchAuth`'s authentication state, as well as associated authentication state in underlying
   * storage.
   */
  private clearActiveUserAuth() {
    if (!this.isLoggedIn) {
      return;
    }

    this.clearUserAuthTokens(this.activeUserAuthInfo.userId!);
  }

  private clearUserAuthTokens(userId: string) {
    const unclearedAuthInfo = this.allUsersAuthInfo.get(userId);
    if (unclearedAuthInfo === undefined) {
      /*
       * This doesn't necessarily mean there's an error. we could be in a 
       * provisional state where the profile request failed and we're just
       * trying to log out the active user.
       */
      if (this.activeUserAuthInfo.userId !== userId) {
        // Only throw if this ID is not the active user either
        throw new StitchClientError(StitchClientErrorCode.UserNotFound);  
      }
    } else if (!unclearedAuthInfo.isLoggedIn) {
      // If the auth info's tokens are already cleared, 
      // There's no need to clear them again
      return;
    }

    try {
      let loggedOutUser: TStitchUser | undefined;

      if (unclearedAuthInfo) {
        const loggedOutAuthInfo = unclearedAuthInfo.loggedOut();
        this.allUsersAuthInfo.set(userId, loggedOutAuthInfo);
        writeAllUsersAuthInfoToStorage(this.allUsersAuthInfo, this.storage);

        loggedOutUser = this.userFactory.makeUser(
          loggedOutAuthInfo.userId!,
          loggedOutAuthInfo.loggedInProviderType!,
          loggedOutAuthInfo.loggedInProviderName!,
          loggedOutAuthInfo.isLoggedIn,
          loggedOutAuthInfo.lastAuthActivity!,
          loggedOutAuthInfo.userProfile
        );
      }
      
      // If the auth info we're clearing is also the active user's auth info, 
      // Clear the active user's auth as well
      let wasActiveUser = false;
      if (this.activeUserAuthInfo.hasUser && this.activeUserAuthInfo.userId === userId) {
        wasActiveUser = true;
        this.activeUserAuthInfo = this.activeUserAuthInfo.withClearedUser();
        this.currentUser = undefined;

        writeActiveUserAuthInfoToStorage(this.activeUserAuthInfo, this.storage);
      }

      /*
       * If a user was actually logged out, and it wasn't just clearing auth 
       * tokens from a provisional state, dispatch a logout event to any 
       * listeners, and additionally dispatch an ActiveUserChanged event if
       * the user being logged out was the active user.
       */
      if (loggedOutUser) {
        this.onAuthEvent(); // Legacy event dispatch

        this.dispatchAuthEvent({
          kind: AuthEventKind.UserLoggedOut,
          loggedOutUser,
        });

        if (wasActiveUser) {
          this.dispatchAuthEvent({
            currentActiveUser: undefined,
            kind: AuthEventKind.ActiveUserChanged,
            previousActiveUser: loggedOutUser
          });
        }
      }
    } catch (err) {
      throw new StitchClientError(
        StitchClientErrorCode.CouldNotPersistAuthInfo
      );
    }
  }
}
