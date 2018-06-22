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

interface StitchAuth {
  isLoggedIn: boolean;

  user?: StitchUser;

  getProviderClient<ClientT>(
    factory: AuthProviderClientFactory<ClientT>
  ): ClientT;

  getProviderClient<T>(
    factory: NamedAuthProviderClientFactory<T>,
    providerName: string
  ): T;

  loginWithCredential(credential: StitchCredential): Promise<StitchUser>;

  loginWithRedirect(credential: StitchRedirectCredential): void;

  hasRedirectResult(): boolean;
  
  handleRedirectResult(): Promise<StitchUser>;

  logout(): Promise<void>;

  addAuthListener(listener: StitchAuthListener);

  removeAuthListener(listener: StitchAuthListener);
}

export default StitchAuth;
