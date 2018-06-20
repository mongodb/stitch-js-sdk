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

import ProviderCapabilities from "./ProviderCapabilities";

/**
 * A credential which can be used to log in as a Stitch user. There is an implementation for each authentication
 * provider available in MongoDB Stitch. These implementations can be generated using an authentication provider
 * client.
 */
export default interface StitchCredential {
  /**
   * The name of the authentication provider that this credential will be used to authenticate with.
   */
  readonly providerName: string;

  /**
   * The type of the authentication provider that this credential will be used to authenticate with.
   */
  readonly providerType: string;

  /**
   * The contents of this credential as they will be passed to the Stitch server.
   */
  readonly material: { [key: string]: string };

  /**
   * A `ProviderCapabilities` object describing the behavior of this credential when logging in.
   */
  providerCapabilities: ProviderCapabilities;
}
