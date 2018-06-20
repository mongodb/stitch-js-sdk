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
import UserPasswordAuthProvider from "./UserPasswordAuthProvider";

enum Fields {
  USERNAME = "username",
  PASSWORD = "password"
}

export default class UserPasswordCredential implements StitchCredential {
  public providerType = UserPasswordAuthProvider.TYPE;

  public readonly material: { [key: string]: string };

  public readonly providerCapabilities = new ProviderCapabilities(false);

  public constructor(
    public readonly username: string,
    public readonly password: string,
    public readonly providerName: string = UserPasswordAuthProvider.DEFAULT_NAME
  ) {
    this.material = {
      [Fields.USERNAME]: this.username,
      [Fields.PASSWORD]: this.password
    };
  }
}
