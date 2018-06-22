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
 * A set of methods for retrieving or modifying the authentication state of a 
 * {@link StitchAppClient}. An implementation can be instantiated with a 
 * {@link StitchAppClient} instance.
 */
export default interface StitchAuth {
  /**
   * Whether or not the client containing this `StitchAuth` object is currently 
   * authenticated.
   */
  isLoggedIn: boolean;

  /**
   * A {@link StitchUser} object representing the user that the client is 
   * currently authenticated as. `undefined` if the client is not currently 
   * authenticated.
   */
  user?: StitchUser;

  /**
   * Retrieves the authentication provider client for the authentication 
   * provider associated with the specified factory.
   * 
   * @param factory The factory that produces the desired client.
   */
  getProviderClient<ClientT>(
    factory: AuthProviderClientFactory<ClientT>
  ): ClientT;

  /**
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
   * Authenticates the client as a MongoDB Stitch user using the provided 
   * {@link StitchCredential}.
   * 
   * @param credential The credential to use when logging in.
   */
  loginWithCredential(credential: StitchCredential): Promise<StitchUser>;

  /**
   * Authenticates the client as a MongoDB Stitch user using the provided 
   * {@link StitchRedirectCredential}. This method will redirect the user to
   * an OAuth2 login page where the login is handled externally. That external
   * page will redirect the user back to the page specified in the redirect
   * credential. To complete the login, that page will need to handle the 
   * redirect by calling {@link handleRedirectResult()}.
   * 
   * @param credential The credential to use when logging in.
   */
  loginWithRedirect(credential: StitchRedirectCredential): void;

  /**
   * Checks whether or not the page was just redirected to from a login process
   * initiated by {@link loginWithRedirect()}. Call this method before calling
   * {@link handleRedirectResult} if you want to avoid errors.
   */
  hasRedirectResult(): boolean;

  /**
   * Handles a redirect by completing the login response and authenticating the
   * client. Should be called by the redirect handling page that 
   * {@link loginWithRedirect()} redirects to.
   */
  handleRedirectResult(): Promise<StitchUser>;

  /**
   * Logs out the currently authenticated user, and clears any persisted 
   * authentication information.
   */
  logout(): Promise<void>;

  /**
   * Registers a {@link StitchAuthListener} with the client.
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
