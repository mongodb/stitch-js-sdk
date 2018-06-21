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

import {
  CoreStitchUserImpl,
  StitchCredential,
  StitchUserProfileImpl
} from "mongodb-stitch-core-sdk";
import StitchRedirectCredential from "../providers/StitchRedirectCredential";
import StitchUser, { StitchUserCodec } from "../StitchUser";
import { prepareRedirect, RedirectFragmentFields, RedirectTypes, StitchAuthImpl } from "./StitchAuthImpl";

export default class StitchUserImpl extends CoreStitchUserImpl
  implements StitchUser {

  public constructor(
    id: string,
    loggedInProviderType: string,
    loggedInProviderName: string,
    profile: StitchUserProfileImpl,
    private readonly auth: StitchAuthImpl
  ) {
    super(id, loggedInProviderType, loggedInProviderName, profile);
  }

  public linkWithCredential(credential: StitchCredential): Promise<StitchUser> {
    return this.auth.linkWithCredential(this, credential);
  }

  public linkUserWithRedirect(
    credential: StitchRedirectCredential
  ): Promise<void> {
    this.auth.setRedirectFragment(
      RedirectFragmentFields.LinkUser,
      JSON.stringify(new StitchUserCodec(this.auth).encode(this))
    );

    const { redirectUrl, state } = prepareRedirect(
      this.auth,
      credential,
      RedirectTypes.Login
    );

    console.log(credential);
    const link = this.auth.browserAuthRoutes.getAuthProviderLinkRedirectRoute(
      credential,
      redirectUrl,
      state,
      this.auth.deviceInfo
    );

    return fetch(
      new Request(link, {
        credentials: "include",
        headers: {
          Authorization: "Bearer " + this.auth.authInfo.accessToken
        }
      })
    ).then(response => {
      window.location.replace(response.headers.get("X-Stitch-Location")!);
    });
  }
}
