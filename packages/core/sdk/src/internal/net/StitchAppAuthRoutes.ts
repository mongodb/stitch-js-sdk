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

import { StitchAuthRoutes } from "../../auth/internal/StitchAuthRoutes";
import { BASE_ROUTE, getAppRoute } from "./StitchAppRoutes";

function getAuthProviderRoute(
  clientAppId: string,
  providerName: string
): string {
  return getAppRoute(clientAppId) + `/auth/providers/${providerName}`;
}

function getAuthProviderLoginRoute(
  clientAppId: string,
  providerName: string
): string {
  return getAuthProviderRoute(clientAppId, providerName) + "/login";
}

function getAuthProviderLinkRoute(
  clientAppId: string,
  providerName: string
): string {
  return getAuthProviderLoginRoute(clientAppId, providerName) + "?link=true";
}

export default class StitchAppAuthRoutes implements StitchAuthRoutes {
  public readonly baseAuthRoute: string = `${BASE_ROUTE}/auth`;

  public readonly sessionRoute: string = (() =>
    `${this.baseAuthRoute}/session`)();

  public readonly profileRoute: string = (() =>
    `${this.baseAuthRoute}/profile`)();

  private readonly clientAppId: string;

  constructor(clientAppId: string) {
    this.clientAppId = clientAppId;
  }

  public getAuthProviderRoute(providerName: string): string {
    return getAuthProviderRoute(this.clientAppId, providerName);
  }

  public getAuthProviderLoginRoute(providerName: string): string {
    return getAuthProviderLoginRoute(this.clientAppId, providerName);
  }

  public getAuthProviderLinkRoute(providerName: string): string {
    return getAuthProviderLinkRoute(this.clientAppId, providerName);
  }

  public getAuthProviderExtensionRoute(providerName: string, path: string) {
    return `${this.getAuthProviderRoute(providerName)}/${path}`;
  }
}
