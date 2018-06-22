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
 * Defines the behavior of a credential based on its authentication provider.
 */
export default class ProviderCapabilities {
  /**
   * A bool indicating whether or not logging in with this credential will re-use the existing authenticated session
   * if there is one. If this is true, then no authentication with the server will be performed if the client is
   * already authenticated, and the existing session will be used. If this is false, then the client will log out of
   * its existing session if it is already logged in.
   */
  public readonly reusesExistingSession: boolean;

  public constructor(reusesExistingSession = false) {
    this.reusesExistingSession = reusesExistingSession;
  }
}
