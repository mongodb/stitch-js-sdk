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

import { StitchCredential } from "mongodb-stitch-core-sdk";
import AuthProviderClientFactory from "./providers/internal/AuthProviderClientFactory";
import NamedAuthProviderClientFactory from "./providers/internal/NamedAuthProviderClientFactory";
import StitchRedirectCredential from "./providers/StitchRedirectCredential";
import StitchAuthListener from "./StitchAuthListener";
import StitchUser from "./StitchUser";

/**
 * StitchAuth represents and controls the login state of a [[StitchAppClient]]. 
 *
 * Login is required for most Stitch functionality. Depending on which
 * [Authentication Provider](https://docs.mongodb.com/stitch/authentication/)
 * you are using, use [[loginWithCredential]] or [[loginWithRedirect]] to log in.
 *
 * Once logged in, [[StitchAuth.user]] is a [[StitchUser]] object that can be examined for 
 * user profile and other information.
 * 
 * Login state can persist across browser sessions. Therefore, a StitchAppClient's
 * StitchAuth instance may already contain login information upon initialization.
 * 
 * In the case of OAuth2 authentication providers, StitchAuth may also initialize with
 * the result of a previous session's request to [[loginWithRedirect]]. The redirect
 * result can be checked with [[hasRedirectResult]] and handled with [[handleRedirectResult]].
 *
 * To log out, use [[logout]].
 *
 * @example
 * For an example of [[loginWithRedirect]], see [Facebook Authentication](https://docs.mongodb.com/stitch/authentication/facebook/).
 * 
 * @see
 * - [Users](https://docs.mongodb.com/stitch/users/)
 * - [Authentication](https://docs.mongodb.com/stitch/authentication/)
 * - [[StitchAppClient]]
 * - [[StitchUser]]
 */
export default interface StitchAuth {
  /**
   * Whether or not there is a currently logged in active user of this 
   * [[StitchAuth]]
   */
  isLoggedIn: boolean;

  /**
   * A [[StitchUser]] object representing the currently logged in, active user,
   * or `undefined` if there is no logged in active user.
   */
  user?: StitchUser;

  /**
   * Returns a list of all users who have logged into this application, except
   * those that have been removed manually and anonymous users who have logged
   * out.
   *
   * @note
   * The list of users is a snapshot of the state when listUsers() is called.
   * The [[StitchUsers]] in this list will not be updated if, e.g., a user's
   * login state changes after this is called.
   *
   * @see
   * - [[removeUser]]
   * - [[removeUserWithId]]
   */
  listUsers(): StitchUser[];

  /**
   * Switches the active user to the user with the specified id. The user must
   * exist in the list of all users who have logged into this application, and
   * the user must be currently logged in, otherwise this will throw a
   * [[StitchClientError]].
   * @param userId the id of the user to switch to
   * @throws an exception if the user is not found, or the found user is not 
   *         logged in
   */
  switchToUserWithId(userId: string): StitchUser

  /** 
   * @hidden
   * Retrieves the authentication provider client for the authentication 
   * provider associated with the specified factory.
   * 
   * @param factory The factory that produces the desired client.
   */
  getProviderClient<ClientT>(
    factory: AuthProviderClientFactory<ClientT>
  ): ClientT;

  /** 
   * @hidden
   * Retrieves the authentication provider client for the authentication 
   * provider associated with the specified factory and auth provider name.
   * 
   * @param factory The factory that produces the desired client.
   */
  getProviderClient<T>(
    factory: NamedAuthProviderClientFactory<T>,
    providerName: string
  ): T;

  /**
   * Logs in as a [[StitchUser]] using the provided [[StitchCredential]].
   * 
   * @param credential The [[StitchCredential]] to use when logging in.
   */
  loginWithCredential(credential: StitchCredential): Promise<StitchUser>;

  /**
   * Authenticates the client as a MongoDB Stitch user using the provided 
   * [[StitchRedirectCredential]].
   * 
   * This method will redirect the user to an OAuth2 login page where the 
   * login is handled externally. That external page will redirect the user 
   * back to the page specified in the redirect credential. To complete 
   * the login, that page will need to handle the redirect by calling
   * [[handleRedirectResult]].
   *
   * For usage examples, see [Facebook Authentication](https://docs.mongodb.com/stitch/authentication/facebook/)
   * and [Google Authentication](https://docs.mongodb.com/stitch/authentication/google/).
   * 
   * @param credential The [[StitchRedirectCredential]] to use when logging in.
   */
  loginWithRedirect(credential: StitchRedirectCredential): void;

  /**
   * Checks whether or not an external login process previously started by [[loginWithRedirect]]
   * has redirected the user to this page.
   * 
   * Stitch will have this information available right after initialization.
   * 
   * Call this method before calling [[handleRedirectResult]] if you want to avoid errors.
   */
  hasRedirectResult(): boolean;

  /**
   * If [[hasRedirectResult]] is true, completes the OAuth2 login previously started by [[loginWithRedirect]].
   */
  handleRedirectResult(): Promise<StitchUser>;

  /**
   * Logs out the currently authenticated active user and clears any persisted 
   * authentication information for that user.
   * 
   * There will be no active user after this logout takes place, even if there
   * are other logged in users. Another user must be explicitly switched to using 
   * [[switchToUserWithId]], [[loginWithCredential]] or [[loginWithRedirect]].
   * 
   * @see
   * - [[removeUser]]
   */
  logout(): Promise<void>;

  /**
   * Logs out the user with the provided id.
   * 
   * The promise rejects with an exception if the user was not found.
   *
   * @note Because anonymous users are deleted after logout, this method is
   * equivalent to [[removeUserWithId]] for anonymous users.
   * 
   * @param userId the id of the user to log out
   */
  logoutUserWithId(userId: string): Promise<void>

  /**
   * Logs out the active user and removes that user from
   * the list of all users associated with this application
   * as returned by [[StitchAuth.listUsers]].
   */
  removeUser(): Promise<void>

  /**
   * Removes the user with the provided id from the list of all users 
   * associated with this application as returned by [[StitchAuth.listUsers]].
   * 
   * If the user was logged in, the user will be logged out before being removed.
   * 
   * The promise rejects with an exception if the user was not found.
   * 
   * @param userId the id of the user to remove
   */
  removeUserWithId(userId: string): Promise<void>

  /**
   * Registers a [[StitchAuthListener]] with the client.
   * @param listener The listener to be triggered when an authentication event
   * occurs on this auth object.
   */
  addAuthListener(listener: StitchAuthListener);

  /**
   * Unregisters a listener.
   * @param listener 
   */
  removeAuthListener(listener: StitchAuthListener);
}
