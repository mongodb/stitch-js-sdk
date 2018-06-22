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

import { base64Encode, StitchAppAuthRoutes } from "mongodb-stitch-core-sdk";
import StitchRedirectCredential from "../providers/StitchRedirectCredential";

export default class StitchBrowserAppAuthRoutes extends StitchAppAuthRoutes {
  constructor(clientAppId: string, private readonly baseUrl: string) {
    super(clientAppId);
  }

  public getAuthProviderRedirectRoute(
    credential: StitchRedirectCredential,
    redirectUrl: string,
    state: string,
    deviceInfo: Record<string, any>
  ): string {
    return `${this.baseUrl}${this.getAuthProviderLoginRoute(
      credential.providerName
    )}?redirect=${encodeURI(
      redirectUrl
    )}&state=${state}&device=${this.uriEncodeObject(deviceInfo)}`;
  }

  public getAuthProviderLinkRedirectRoute(
    credential: StitchRedirectCredential,
    redirectUrl: string,
    state: string,
    deviceInfo: Record<string, any>
  ): string {
    return `${this.baseUrl}${this.getAuthProviderLoginRoute(
      credential.providerName
    )}?redirect=${encodeURI(
      redirectUrl
    )}&state=${state}&device=${this.uriEncodeObject(
      deviceInfo
    )}&link=true&providerRedirectHeader=true`;
  }

  /**
   * Utility function to encode a JSON object into a valid string that can be
   * inserted in a URI. The object is first stringified, then encoded in base64,
   * and finally encoded via the builtin encodeURIComponent function.
   *
   * @memberof util
   * @param {object} obj The object to encode
   * @returns {string} The encoded object
   */
  private uriEncodeObject(obj: object): string {
    return encodeURIComponent(base64Encode(JSON.stringify(obj)));
  }
}
