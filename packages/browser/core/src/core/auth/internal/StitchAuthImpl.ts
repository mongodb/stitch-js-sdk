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

import { detect } from "detect-browser";
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
  StitchRequestClient,
  StitchUserFactory,
  Storage
} from "mongodb-stitch-core-sdk";

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
import StitchRedirectError from "./StitchRedirectError";
import StitchUserFactoryImpl from "./StitchUserFactoryImpl";

const alphaNumericCharacters =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

/**
 * Partial JSDOM window.location containing only the
 * properties and method we need
 */
interface PartialLocaion {
  hash: string;
  protocol: string;
  host: string;
  pathname: string;

  replace(url: string);
}

/**
 * Partial JSDOM window.history containing only the method
 * we need
 */
interface PartialHistory {
  replaceState(data: any, title?: string, url?: string | null);
}

/**
 * Partial JSDOM window interface to contract the functionality
 * of the window for StitchAuthImpl
 */
interface PartialWindow {
  location: PartialLocaion;
  history: PartialHistory;
}

/** @hidden */
export default class StitchAuthImpl extends CoreStitchAuth<StitchUser>
  implements StitchAuth {
  private readonly listeners: Set<StitchAuthListener> = new Set();

  /**
   * Construct a new StitchAuth implementation
   *
   * @param requestClient StitchRequestClient that does request
   * @param browserAuthRoutes pathnames to call for browser routes
   * @param authStorage internal storage
   * @param appInfo info about the current stitch app
   * @param jsdomWindow window interface to interact with JSDOM window
   */
  public constructor(
    requestClient: StitchRequestClient,
    private readonly browserAuthRoutes: StitchBrowserAppAuthRoutes,
    private readonly authStorage: Storage,
    private readonly appInfo: StitchAppClientInfo,
    private readonly jsdomWindow: PartialWindow = window
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
    const { redirectUrl, state } = this.prepareRedirect(credential);

    this.jsdomWindow.location.replace(
      this.browserAuthRoutes.getAuthProviderRedirectRoute(
        credential,
        redirectUrl,
        state,
        this.deviceInfo
      )
    );
  }

  public linkWithRedirectInternal(
    user: StitchUser,
    credential: StitchRedirectCredential
  ) {
    if (this.user !== undefined && user.id !== this.user.id) {
      return Promise.reject(
        new StitchClientError(StitchClientErrorCode.UserNoLongerValid)
      );
    }

    const { redirectUrl, state } = this.prepareRedirect(credential);

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
      this.jsdomWindow.location.replace(
        response.headers.get("X-Stitch-Location")!
      );
    });
  }

  public hasRedirectResult(): boolean {
    let isValid = false;
    try {
      isValid = this.parseRedirect().isValid;
      return isValid;
    } catch (_) {
      return false;
    } finally {
      if (!isValid) {
        this.cleanupRedirect();
      }
    }
  }

  public handleRedirectResult(): Promise<StitchUser> {
    try {
      const providerName = this.authStorage.get(RedirectKeys.ProviderName);
      const providerType = this.authStorage.get(RedirectKeys.ProviderType);

      return this.loginWithCredentialInternal(
        new StitchAuthResponseCredential(
          this.processRedirectResult(),
          providerType,
          providerName
        )
      ).then(user => {
        return user;
      });
    } catch (err) {
      return Promise.reject(err);
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

  private cleanupRedirect() {
    this.jsdomWindow.history.replaceState(null, "", this.pageRootUrl());

    this.authStorage.remove(RedirectKeys.State);
    this.authStorage.remove(RedirectKeys.ProviderName);
    this.authStorage.remove(RedirectKeys.ProviderType);
  }

  private parseRedirect(): ParsedRedirectFragment | never {
    if (typeof this.jsdomWindow === "undefined") {
      // This means we're running in some environment other
      // than a browser - so handling a redirect makes no sense here.
      throw new StitchRedirectError("running in a non-browser environment");
    }

    if (!this.jsdomWindow.location || !this.jsdomWindow.location.hash) {
      throw new StitchRedirectError("window location hash was undefined");
    }

    const ourState = this.authStorage.get(RedirectKeys.State);
    const redirectFragment = this.jsdomWindow.location.hash.substring(1);

    return parseRedirectFragment(
      redirectFragment,
      ourState,
      this.appInfo.clientAppId
    );
  }

  private processRedirectResult(): AuthInfo | never {
    let redirectFragment: ParsedRedirectFragment;
    try {
      redirectFragment = this.parseRedirect();

      if (!redirectFragment.isValid) {
        throw new StitchRedirectError(`invalid redirect result`);
      }

      if (redirectFragment.lastError) {
        // remove the fragment from the window history and reject
        throw new StitchRedirectError(
          `error handling redirect: ${redirectFragment.lastError}`
        );
      }

      if (!redirectFragment.authInfo) {
        throw new StitchRedirectError(
          "no user auth value was found: it could not be decoded from fragment"
        );
      }
    } catch (err) {
      throw err;
    } finally {
      this.cleanupRedirect();
    }

    return redirectFragment.authInfo;
  }

  private prepareRedirect(
    credential: StitchRedirectCredential
  ): { redirectUrl: string; state: string } {
    this.authStorage.set(RedirectKeys.ProviderName, credential.providerName);
    this.authStorage.set(RedirectKeys.ProviderType, credential.providerType);

    let redirectUrl = credential.redirectUrl;
    if (redirectUrl === undefined) {
      redirectUrl = this.pageRootUrl();
    }

    const state = generateState();
    this.authStorage.set(RedirectKeys.State, state);

    return { redirectUrl, state };
  }

  private pageRootUrl(): string {
    return [
      this.jsdomWindow.location.protocol,
      "//",
      this.jsdomWindow.location.host,
      this.jsdomWindow.location.pathname
    ].join("");
  }
}

function generateState(): string {
  let state = "";
  for (let i = 0; i < 64; ++i) {
    state += alphaNumericCharacters.charAt(
      Math.floor(Math.random() * alphaNumericCharacters.length)
    );
  }
  return state;
}

function unmarshallUserAuth(data): AuthInfo {
  const parts = data.split("$");
  if (parts.length !== 4) {
    throw new StitchRedirectError(
      "invalid user auth data provided while " +
        "marshalling user authentication data: " +
        data
    );
  }

  const [accessToken, refreshToken, userId, deviceId] = parts;
  return new AuthInfo(userId, deviceId, accessToken, refreshToken);
}

class ParsedRedirectFragment {
  public stateValid: boolean = false;
  public authInfo?: AuthInfo;
  public lastError?: string;
  public clientAppIdValid: boolean = false;

  get isValid(): boolean {
    return this.stateValid && this.clientAppIdValid;
  }
}

function parseRedirectFragment(
  fragment,
  ourState,
  ourClientAppId
): ParsedRedirectFragment {
  // After being redirected from oauth, the URL will look like:
  // https://todo.examples.stitch.mongodb.com/#_stitch_state=...&_stitch_ua=...
  // This function parses out stitch-specific tokens from the fragment and
  // builds an object describing the result.
  const vars = fragment.split("&");
  const result: ParsedRedirectFragment = new ParsedRedirectFragment();
  vars.forEach(kvp => {
    // for (let i = 0; i < vars.length; ++i) {
    const pairParts = kvp.split("=");
    const pairKey = decodeURIComponent(pairParts[0]);

    switch (pairKey) {
      case RedirectFragmentFields.StitchError:
        result.lastError = decodeURIComponent(pairParts[1]);
        break;
      case RedirectFragmentFields.UserAuth:
        try {
          result.authInfo = unmarshallUserAuth(
            decodeURIComponent(pairParts[1])
          );
        } catch (e) {
          result.lastError = e;
        }
        break;
      case RedirectFragmentFields.StitchLink:
        break;
      case RedirectFragmentFields.State:
        const theirState = decodeURIComponent(pairParts[1]);

        if (ourState === theirState) {
          result.stateValid = true;
        }
        break;
      case RedirectFragmentFields.ClientAppId:
        const clientAppId = decodeURIComponent(pairParts[1]);
        if (ourClientAppId === clientAppId) {
          result.clientAppIdValid = true;
        }
        break;
      default:
        break;
    }
  });

  return result;
}

function isAuthProviderClientFactory<ClientT>(
  factory:
    | AuthProviderClientFactory<ClientT>
    | NamedAuthProviderClientFactory<ClientT>
): factory is AuthProviderClientFactory<ClientT> {
  return (
    (factory as AuthProviderClientFactory<ClientT>).getClient !== undefined
  );
}
