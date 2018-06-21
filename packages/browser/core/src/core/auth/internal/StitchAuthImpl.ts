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
  AuthInfo,
  CoreStitchAuth,
  CoreStitchUser,
  DeviceFields,
  StitchAppClientInfo,
  StitchAuthResponseCredential,
  StitchClientError,
  StitchClientErrorCode,
  StitchCredential,
  StitchError,
  StitchRequestClient,
  StitchUserFactory,
  Storage,
} from "mongodb-stitch-core-sdk";

import { detect } from "detect-browser";
import version from "../../internal/common/Version";
import AuthProviderClientFactory from "../providers/internal/AuthProviderClientFactory";
import NamedAuthProviderClientFactory from "../providers/internal/NamedAuthProviderClientFactory";
import StitchRedirectCredential from "../providers/StitchRedirectCredential";
import StitchAuth from "../StitchAuth";
import StitchAuthListener from "../StitchAuthListener";
import StitchUser from "../StitchUser";
import RedirectFragmentFields from "./RedirectFragmentFields";
import RedirectKeys from "./RedirectKeys";
import StitchBrowserAppAuthRoutes from "./StitchBrowserAppAuthRoutes";
import StitchUserFactoryImpl from "./StitchUserFactoryImpl";

const alphaNumericCharacters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

class StitchRedirectError extends StitchError {
  constructor(msg: string) { super(msg); }
}

export default class StitchAuthImpl extends CoreStitchAuth<StitchUser>
  implements StitchAuth {
  private readonly listeners: Set<StitchAuthListener> = new Set();

  public constructor(
    requestClient: StitchRequestClient,
    public readonly browserAuthRoutes: StitchBrowserAppAuthRoutes,
    private readonly authStorage: Storage,
    private readonly appInfo: StitchAppClientInfo
  ) {
    super(requestClient, browserAuthRoutes, authStorage);
  }

  protected get userFactory(): StitchUserFactory<StitchUser> {
    return new StitchUserFactoryImpl(this);
  }

  public getProviderClient<ClientT>(
    factory:
      | AuthProviderClientFactory<ClientT>
      | NamedAuthProviderClientFactory<ClientT>,
    providerName?: string
  ): ClientT {
    if (isAuthProviderClientFactory(factory)) {
      return factory.getClient(this, this.requestClient, this.authRoutes);
    } else {
      return factory.getNamedClient(
        providerName!,
        this.requestClient,
        this.authRoutes
      );
    }
  }

  public loginWithCredential(
    credential: StitchCredential
  ): Promise<StitchUser> {
    return super.loginWithCredentialInternal(credential);
  }

  public loginWithRedirect(credential: StitchRedirectCredential): void {
    const { redirectUrl, state } = this.prepareRedirect(
      credential,
    );

    window.location.replace(
      this.browserAuthRoutes.getAuthProviderRedirectRoute(
        credential,
        redirectUrl,
        state,
        this.deviceInfo
      )
    );
  }

  public linkWithRedirect(
    user: StitchUser,
    credential: StitchRedirectCredential
  ) {
    if (this.user !== undefined && user.id !== this.user.id) {
      return Promise.reject(
        new StitchClientError(StitchClientErrorCode.UserNoLongerValid)
      );
    }

    const { redirectUrl, state } = this.prepareRedirect(
      credential
    );

    const link = this.browserAuthRoutes.getAuthProviderLinkRedirectRoute(
      credential,
      redirectUrl,
      state,
      this.deviceInfo
    );

    return fetch(
      new Request(link, {
        credentials: "include",
        headers: {
          Authorization: "Bearer " + this.authInfo.accessToken
        }
      })
    ).then(response => {
      window.location.replace(response.headers.get("X-Stitch-Location")!);
    });
  }

  public hasRedirectResult(): boolean {
    try {
      this.processRedirectResult();
      return true;
    } catch (_) {
      return false;
    }
  }

  public handleRedirectResult(): Promise<StitchUser> {
    const cleanup = () => {
      this.authStorage.remove(RedirectFragmentFields.State);
      this.authStorage.remove(RedirectKeys.RedirectProvider);
    };

    try {
      const redirectState = this.processRedirectResult();
      const redirectProvider = this.authStorage.get(RedirectKeys.RedirectProvider);
      // If we get here, the state is valid - set auth appropriately.

      return this.loginWithCredentialInternal(
        new StitchAuthResponseCredential(
          redirectState.ua!,
          redirectProvider,
          redirectProvider
        )
      ).then(user => {
        window.history.replaceState(null, "", pageRootUrl());
        return user;
      });
    } catch (err) {
      return Promise.reject(err)
    } finally {
      cleanup();
    }
  }

  public linkWithCredential(
    user: CoreStitchUser,
    credential: StitchCredential
  ): Promise<StitchUser> {
    return super.linkUserWithCredentialInternal(user, credential);
  }

  public logout(): Promise<void> {
    return Promise.resolve(super.logoutInternal());
  }

  protected get deviceInfo() {
    const info = {};
    if (this.hasDeviceId) {
      info[DeviceFields.DEVICE_ID] = this.deviceId;
    }
    if (this.appInfo.localAppName !== undefined) {
      info[DeviceFields.APP_ID] = this.appInfo.localAppName;
    }
    if (this.appInfo.localAppVersion !== undefined) {
      info[DeviceFields.APP_VERSION] = this.appInfo.localAppVersion;
    }

    const browser = detect();

    if (browser) {
      info[DeviceFields.PLATFORM] = browser.name;
      info[DeviceFields.PLATFORM_VERSION] = browser.version;
    } else {
      info[DeviceFields.PLATFORM] = "web";
      info[DeviceFields.PLATFORM_VERSION] = "0.0.0";
    }

    info[DeviceFields.SDK_VERSION] = version;

    return info;
  }

  public addAuthListener(listener: StitchAuthListener) {
    this.listeners.add(listener);

    // Trigger the onUserLoggedIn event in case some event happens and
    // this caller would miss out on this event other wise.
    this.onAuthEvent(listener);
  }

  public removeAuthListener(listener: StitchAuthListener) {
    this.listeners.delete(listener);
  }

  public onAuthEvent(listener?: StitchAuthListener) {
    if (listener) {
      const auth = this;
      const _ = new Promise(resolve => {
        listener.onAuthEvent(auth);
        resolve(undefined);
      });
    } else {
      this.listeners.forEach(one => {
        this.onAuthEvent(one);
      });
    }
  }

  private processRedirectResult(): ParsedRedirectFragment | never {
    if (typeof window === "undefined") {
      // This means we're running in some environment other
      // than a browser - so handling a redirect makes no sense here.
      throw new StitchRedirectError("running in a non-browser environment")
    }

    if (!window.location || !window.location.hash) {
      throw new StitchRedirectError("window location hash was undefined")
    }

    const ourState = this.authStorage.get(RedirectFragmentFields.State);
    const redirectProvider = this.authStorage.get(RedirectKeys.RedirectProvider);
    
    const redirectFragment = window.location.hash.substring(1);
    const redirectState = parseRedirectFragment(
      redirectFragment,
      ourState
    );

    if (!redirectState.clientAppId || redirectState.clientAppId !== this.appInfo.clientAppId) {
      throw new StitchRedirectError(
        `client app id ${
          redirectState.clientAppId
        } does not match current appId ${this.appInfo.clientAppId}`
      )
    }
    if (redirectState.lastError || (redirectState.found && !redirectProvider)) {
      // remove the fragment from the window history and reject
      window.history.replaceState(null, "", pageRootUrl());
      throw new StitchRedirectError(
          `error handling redirect: ${
            redirectState.lastError
              ? redirectState.lastError
              : "provider type not set"
          }`
      );
    }

    if (!redirectState.found) {
      throw new StitchRedirectError(
          `no redirect state found: ${
            redirectState.lastError
              ? redirectState.lastError
              : "missing from redirect fragments"
          }`
        )
    }

    if (!redirectState.stateValid) {
      window.history.replaceState(null, "", pageRootUrl());
      throw new StitchRedirectError(
          `redirect state values did not match: ${
            redirectState.lastError ? redirectState.lastError : 
            "their state could not be decoded"
          }`
        )
    }

    if (!redirectState.ua) {
      throw new StitchRedirectError(
        `no user auth value was found: ${
          redirectState.lastError
              ? redirectState.lastError
              : "it could not be decoded from fragment"
        }`
      );
    }

    return redirectState;
  }

  private prepareRedirect(
    credential: StitchRedirectCredential,
  ): { redirectUrl: string; state: string } {
    this.authStorage.set(RedirectKeys.RedirectProvider, credential.providerType);
    let redirectUrl = credential.redirectUrl;
    if (redirectUrl === undefined) {
      redirectUrl = pageRootUrl();
    }
  
    const state = generateState();
    this.authStorage.set(RedirectFragmentFields.State, state);
  
    return { redirectUrl, state };
  }
}

function generateState(): string {
  let state = "";
  for (let i = 0; i < 64; ++i) {
    state += alphaNumericCharacters.charAt(Math.floor(Math.random() * alphaNumericCharacters.length));
  }
  return state;
}

function pageRootUrl(): string {
  return [
    window.location.protocol,
    "//",
    window.location.host,
    window.location.pathname
  ].join("");
}

function unmarshallUserAuth(data): AuthInfo {
  const parts = data.split("$");
  if (parts.length !== 4) {
    throw new StitchRedirectError(
      "invalid user auth data provided while " +
      "marshalling user authentication data: " + data
    );
  }

  const [accessToken, refreshToken, userId, deviceId] = parts;
  return new AuthInfo(userId, deviceId, accessToken, refreshToken);
}

interface ParsedRedirectFragment {
  ua?: AuthInfo;
  found: boolean;
  stateValid: boolean;
  lastError?: string;
  clientAppId?: string;
}

function parseRedirectFragment(fragment, ourState): ParsedRedirectFragment {
  // After being redirected from oauth, the URL will look like:
  // https://todo.examples.stitch.mongodb.com/#_stitch_state=...&_stitch_ua=...
  // This function parses out stitch-specific tokens from the fragment and
  // builds an object describing the result.
  const vars = fragment.split("&");
  const result: ParsedRedirectFragment = { found: false, stateValid: false };

  let shouldBreak = false;
  for (let i = 0; i < vars.length && !shouldBreak; ++i) {
    const pairParts = vars[i].split("=");
    const pairKey = decodeURIComponent(pairParts[0]);
    switch (pairKey) {
      case RedirectFragmentFields.StitchError:
        result.lastError = decodeURIComponent(pairParts[1]);
        result.found = true;
        shouldBreak = true;
        break;
      case RedirectFragmentFields.UserAuth:
        try {
          result.ua = unmarshallUserAuth(
            decodeURIComponent(pairParts[1])
          );
          result.found = true;
        } catch (e) {
          result.lastError = e;
        }
        continue;
      case RedirectFragmentFields.StitchLink:
        result.found = true;
        continue;
      case RedirectFragmentFields.State:
        result.found = true;
        const theirState = decodeURIComponent(pairParts[1]);
        if (ourState && ourState === theirState) {
          result.stateValid = true;
        }
        continue;
      case RedirectFragmentFields.ClientAppId:
        result.clientAppId = decodeURIComponent(pairParts[1]);
        continue;
      default:
        continue;
    }
  }

  return result;
}

function isAuthProviderClientFactory<ClientT>(
  factory:
    | AuthProviderClientFactory<ClientT>
    | NamedAuthProviderClientFactory<ClientT>
): factory is AuthProviderClientFactory<ClientT> {
  return (factory as AuthProviderClientFactory<ClientT>).getClient !== undefined;
}
