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
import ServerApiKeyAuthProvider from "./ServerApiKeyAuthProvider";

enum Fields {
  KEY = "key"
}

/**
 * A credential which can be used to log in as a Stitch user
 * using the Server API Key authentication provider.
 */
export default class ServerApiKeyCredential implements StitchCredential {
  /**
   * The name of the provider for this credential.
   */
  public readonly providerName: string;
  /**
   * The type of the provider for this credential.
   */
  public readonly providerType = ServerApiKeyAuthProvider.TYPE;
  /**
   * The contents of this credential as they will be passed to the Stitch server.
   */
  public readonly material: { [key: string]: string } = (() => {
    return { [Fields.KEY]: this.key };
  })();
  /**
   * The behavior of this credential when logging in.
   */
  public readonly providerCapabilities = new ProviderCapabilities(false);
  /**
   * The server API key contained within this credential.
   */
  private readonly key: string;

  constructor(
    key: string,
    providerName: string = ServerApiKeyAuthProvider.DEFAULT_NAME
  ) {
    this.providerName = providerName;
    this.key = key;
  }
}
