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
import StitchAuthListener from "./StitchAuthListener";
import StitchUser from "./StitchUser";

/**
 * StitchAuth represents and controls the login state of a [[StitchAppClient]]. 
 *
 * Login is required for most Stitch functionality. Decide which
 * [Authentication Provider](https://docs.mongodb.com/stitch/authentication/)
 * you are using and use [[loginWithCredential]] to log in.
 *
 * Once logged in, [[StitchAuth.user]] is a [[StitchUser]] object that can be examined for 
 * user profile and other information.
 * 
 * Login state can persist across browser sessions. Therefore, a StitchAppClient's
 * StitchAuth instance may already contain login information upon initialization.
 *
 * To log out, use [[logout]].
 *
 * ### Examples
 *
 * For an example of [[loginWithCredential]], see [Anonymous Authentication](https://docs.mongodb.com/stitch/authentication/anonymous/).
 *
 * ### See also
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
   * those that have been removed manually, and anonymous users who have logged
   * out.
   */
  listUsers(): Array<StitchUser>;

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

  /** @hidden
   * Retrieves the authentication provider client for the authentication 
   * provider associated with the specified factory.
   * 
   * @param factory The factory that produces the desired client.
   */
  getProviderClient<ClientT>(
    factory: AuthProviderClientFactory<ClientT>
  ): ClientT;

  /** @hidden
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
   * For an example of the most simple form of authentication, see
   * [Anonymous Authentication](https://docs.mongodb.com/stitch/authentication/anonymous/).
   *
   * For another example, see [Email/Password Authentication](https://docs.mongodb.com/stitch/authentication/userpass/).
   *
   * @param credential The [[StitchCredential]] to use when logging in.
   */
  loginWithCredential(credential: StitchCredential): Promise<StitchUser>;

  /**
   * Logs out the currently authenticated active user, and clears any persisted 
   * authentication information for that user. There will be no active user 
   * after this logout takes place, even if there are other logged in users.
   * A user must be explicitly switched to, or a user must be logged in with
   * a new credential.
   */
  logout(): Promise<void>;

  /**
   * Logs out the user with the provided id. The promise rejects with an 
   * exception if the user was not found,
   * @param userId the id of the user to log out
   */
  logoutUserWithId(userId: string): Promise<void>

  /**
   * Logs out the currently logged in, active user, and removes that user from
   * the list of all users associated with this application.
   */
  removeUser(): Promise<void>

  /**
   * Removes the user with the provided id from the list of all users 
   * associated with this application. If the user was logged in, the user will
   * be logged out before being removed. The promise rejects with an exception 
   * if the user was not found.
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
