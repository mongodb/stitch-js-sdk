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

/**
 * An interface representing the authentication API routes on the Stitch server.
 */
export interface StitchAuthRoutes {
  /**
   * The route on the server for getting a new access token.
   */
  sessionRoute: string;

  /**
   * The route on the server for fetching the currently authenticated user's profile.
   */
  profileRoute: string;

  /**
   * The base route on the server for authentication-related actions.
   */
  baseAuthRoute: string;

  /**
   * Returns the route on the server for getting information about a particular authentication provider.
   */
  getAuthProviderRoute(providerName: string): string;

  /**
   * Returns the route on the server for logging in with a particular authentication provider.
   */
  getAuthProviderLoginRoute(providerName: string): string;

  /**
   * Returns the route on the server for linking the currently authenticated user with an identity associated with a
   * particular authentication provider.
   */
  getAuthProviderLinkRoute(providerName: string): string;

  getAuthProviderExtensionRoute(providerName: string, path: string);
}
