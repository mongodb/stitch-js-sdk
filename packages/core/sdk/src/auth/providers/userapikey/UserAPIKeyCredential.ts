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
import UserApiKeyAuthProvider from "./UserApiKeyAuthProvider";

enum Fields {
  KEY = "key"
}

/**
 * A credential which can be used to log in as a Stitch user
 * using the User API Key authentication provider.
 */
export default class UserApiKeyCredential implements StitchCredential {
  /**
   * The name of the provider for this credential.
   */
  public readonly providerName: string;
  /**
   * The user API key contained within this credential.
   */
  public readonly key: string;
  /**
   * The type of the provider for this credential.
   */
  public readonly providerType = UserApiKeyAuthProvider.TYPE;
  /**
   * The contents of this credential as they will be passed to the Stitch server.
   */
  public readonly material: { [key: string]: string };
  /**
   * The behavior of this credential when logging in.
   */
  public readonly providerCapabilities = new ProviderCapabilities(false);

  constructor(
    key: string,
    providerName: string = UserApiKeyAuthProvider.DEFAULT_NAME
  ) {
    this.providerName = providerName;
    this.key = key;
    this.material = {
      [Fields.KEY]: this.key
    };
  }
}
