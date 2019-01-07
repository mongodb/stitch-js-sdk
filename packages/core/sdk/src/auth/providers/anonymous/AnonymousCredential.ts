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

import ProviderCapabilities from "../../ProviderCapabilities";
import StitchCredential from "../../StitchCredential";
import AnonymousAuthProvider from "./AnonymousAuthProvider";

/**
 * The AnonymousCredential is a [[StitchCredential]] that logs in
 * using the [Anonymous Authentication Provider](https://docs.mongodb.com/stitch/authentication/anonymous/).
 *
 * ### Example
 * ```
 * const client = Stitch.initializeDefaultAppClient('example-app-id')
 * client.auth.loginWithCredential(new AnonymousCredential())
 *   .then(user => {
 *     // Now logged in anonymously
 *   })
 *   .catch(console.error)
 * ```
 *
 * ### See also
 * - [[StitchAuth.loginWithCredential]] 
*/
export default class AnonymousCredential implements StitchCredential {
  /**
   * The name of the provider for this credential.
   */
  public readonly providerName: string;
  /**
   * The type of the provider for this credential.
   */
  public readonly providerType = AnonymousAuthProvider.TYPE;
  /**
   * The contents of this credential as they will be passed to the Stitch server.
   */
  public readonly material = {};
  /**
   * The behavior of this credential when logging in.
   */
  public readonly providerCapabilities = new ProviderCapabilities(true);

  constructor(providerName: string = AnonymousAuthProvider.DEFAULT_NAME) {
    this.providerName = providerName;
  }
}
