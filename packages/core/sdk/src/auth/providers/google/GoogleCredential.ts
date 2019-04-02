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
import GoogleAuthProvider from "./GoogleAuthProvider";

enum Fields {
  AUTH_CODE = "authCode"
}

/** 
 * A credential which can be used to log in as a Stitch user
 * using the Google authentication provider.
 *
 * Browser SDK users can use the 
 * [GoogleRedirectCredential](https://docs.mongodb.com/stitch-sdks/js/4/classes/googleredirectcredential.html)
 * with [StitchAuth.loginWithRedirect](https://docs.mongodb.com/stitch-sdks/js/4/interfaces/stitchauth.html#loginwithredirect).
 * Server and React Native SDK users must obtain their own server auth code.
 * Use a third-party module to get this code and pass it to the GoogleCredential
 * constructor.
 */
export default class GoogleCredential implements StitchCredential {
  /**
   * The name of the provider for this credential.
   */
  public readonly providerName: string;
  /**
   * The type of the provider for this credential.
   */
  public readonly providerType = GoogleAuthProvider.TYPE;

  /**
   * The contents of this credential as they will be passed to the Stitch server.
   */
  public readonly material: { [key: string]: string };

  /**
   * The behavior of this credential when logging in.
   */
  public readonly providerCapabilities = new ProviderCapabilities(false);

  /**
   * The Google OAuth2 authentication code contained within this credential.
   */
  private readonly authCode: string;

  constructor(
    authCode: string,
    providerName: string = GoogleAuthProvider.DEFAULT_NAME
  ) {
    this.providerName = providerName;
    this.authCode = authCode;
    this.material = { [Fields.AUTH_CODE]: this.authCode };
  }
}
