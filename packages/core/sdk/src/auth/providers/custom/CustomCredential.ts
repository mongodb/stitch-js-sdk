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
import CustomAuthProvider from "./CustomAuthProvider";

enum Fields {
  TOKEN = "token"
}

/**
 * A credential which can be used to log in as a Stitch user
 * using the Custom authentication provider.
 */
export default class CustomCredential implements StitchCredential {
  /**
   * The name of the provider for this credential.
   */
  public providerName: string;
  /**
   * The type of the provider for this credential.
   */
  public readonly providerType = CustomAuthProvider.TYPE;
  /**
   * The behavior of this credential when logging in.
   */
  public readonly providerCapabilities = new ProviderCapabilities(false);
  /**
   * The contents of this credential as they will be passed to the Stitch server.
   */
  public readonly material: { [key: string]: string };
  /**
   * The JWT contained within this credential.
   */
  private token: string;

  constructor(
    token: string,
    providerName: string = CustomAuthProvider.DEFAULT_NAME
  ) {
    this.providerName = providerName;
    this.token = token;
    this.material = { [Fields.TOKEN]: this.token };
  }
}
