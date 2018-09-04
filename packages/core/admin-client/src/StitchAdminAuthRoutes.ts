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

import { StitchAuthRoutes } from "mongodb-stitch-core-sdk";

/**
 * The set of authentication routes on the Stitch server to authenticate as an admin user.
 */
export default class StitchAdminAuthRoutes implements StitchAuthRoutes {
  get baseAuthRoute(): string {
    return `${this.apiPath}/auth`;
  }

  /**
   * The route on the server for getting a new access token.
   */
  get sessionRoute(): string {
    return `${this.baseAuthRoute}/session`;
  }

  /**
   * The route on the server for fetching the currently authenticated user's profile.
   */
  get profileRoute(): string {
    return `${this.baseAuthRoute}/profile`;
  }

  constructor(private readonly apiPath: string) {

  }
  /**
   * Returns the route on the server for a particular authentication provider.
   */
  public getAuthProviderRoute(providerName: string): string {
    return `${this.baseAuthRoute}/providers/${providerName}`;
  }

  /**
   * Returns the route on the server for logging in with a particular authentication provider.
   */
  public getAuthProviderLoginRoute(providerName: string): string {
    return `${this.getAuthProviderRoute(providerName)}/login`;
  }

  /**
   * Returns the route on the server for linking the currently authenticated user with an identity associated with a
   * particular authentication provider.
   */
  public getAuthProviderLinkRoute(providerName: string): string {
    return `${this.getAuthProviderLoginRoute(providerName)}?link=true`;
  }

  public getAuthProviderExtensionRoute(
    providerName: string,
    path: string
  ): string {
    return `${this.getAuthProviderRoute(providerName)}/${path}`;
  }
}
