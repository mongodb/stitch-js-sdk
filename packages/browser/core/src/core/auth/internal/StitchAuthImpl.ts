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
  StitchCredential,
  StitchException,
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
import StitchBrowserAppAuthRoutes from "./StitchBrowserAppAuthRoutes";
import StitchUserFactoryImpl from "./StitchUserFactoryImpl";

export enum RedirectKeys {
  RedirectProvider = "redirectProvider",
  Type = "_stitch_redirect_type",
}

export enum RedirectFragmentFields {
  StitchError = "_stitch_error",
  State = "_stitch_state",
  UserAuth = "_stitch_ua",
  LinkUser = "_stitch_link_user",
  StitchLink = "_stitch_link",
}

export enum RedirectTypes {
  Link = "isLink",
  Login = "isLogin"
}

interface ParsedRedirectFragment {
  ua?: AuthInfo;
  found: boolean;
  stateValid: boolean;
  lastError?: string;
}

const alphaNumericCharacters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

class StitchRedirectError extends StitchException {
  constructor(msg: string) { super(msg); }
}

export class StitchAuthImpl extends CoreStitchAuth<StitchUser>
  implements StitchAuth {
  private readonly listeners: Set<StitchAuthListener> = new Set();

  public constructor(
    requestClient: StitchRequestClient,
    public readonly browserAuthRoutes: StitchBrowserAppAuthRoutes,
    private readonly storageRef: Storage,
    private readonly appInfo: StitchAppClientInfo
  ) {
    super(requestClient, browserAuthRoutes, storageRef);
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
    const { redirectUrl, state } = prepareRedirect(
      this,
      credential,
      RedirectTypes.Login
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

  public hasRedirect(): boolean {
    return !!this.storageRef.get(RedirectFragmentFields.State);
  }

  public handleRedirectResult(): Promise<StitchUser> {
    const cleanup = () => {
      this.storageRef.remove(RedirectFragmentFields.State);
      this.storageRef.remove(RedirectKeys.RedirectProvider);
    };

    if (typeof window === "undefined") {
      // This means we're running in some environment other
      // than a browser - so handling a redirect makes no sense here.
      cleanup();
      return Promise.reject(
        new StitchRedirectError(
          "running in other than browser"  
        )
      );
    }

    if (!window.location || !window.location.hash) {
      cleanup();
      return Promise.reject(new StitchRedirectError("window location hash was undefined"));
    }

    const ourState = this.storageRef.get(RedirectFragmentFields.State);
    const redirectProvider = this.storageRef.get(RedirectKeys.RedirectProvider);

    cleanup();

    const redirectFragment = window.location.hash.substring(1);
    const redirectState = parseRedirectFragment(
      redirectFragment,
      ourState
    );

    if (redirectState.lastError || (redirectState.found && !redirectProvider)) {
      // remove the fragment from the window history and reject
      window.history.replaceState(null, "", pageRootUrl());
      return Promise.reject(
        new StitchRedirectError(
          `StitchClient: error from redirect: ${
            redirectState.lastError
              ? redirectState.lastError
              : "provider type not set"
          }`
        )
      );
    }

    if (!redirectState.found) {
      return Promise.reject(new StitchRedirectError(`no redirect state found`));
    }

    if (!redirectState.stateValid) {
      window.history.replaceState(null, "", pageRootUrl());
      return Promise.reject(new StitchRedirectError("StitchClient: state values did not match!"));
    }

    if (!redirectState.ua) {
      return Promise.reject(new StitchRedirectError(
        "StitchClient: no UA value was returned from redirect!"
      ));
    }

    // If we get here, the state is valid - set auth appropriately.
    return this.loginWithCredentialInternal(
      new StitchAuthResponseCredential(redirectState.ua)
    ).then(user => {
      window.history.replaceState(null, "", pageRootUrl());
      return user;
    });
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

  public get deviceInfo() {
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

  public setRedirectFragment(key: RedirectKeys | RedirectFragmentFields, value: any) {
    this.storageRef.set(key, value);
  }
}

function generateState(): string {
  let state = "";
  for (let i = 0; i < 64; ++i) {
    state += alphaNumericCharacters.charAt(Math.floor(Math.random() * alphaNumericCharacters.length));
  }

  return state;
}

export function prepareRedirect(
  auth: StitchAuthImpl,
  credential: StitchRedirectCredential,
  redirectType: RedirectTypes
): { redirectUrl: string; state: string } {
  auth.setRedirectFragment(RedirectKeys.RedirectProvider, credential.providerType);
  let redirectUrl = credential.redirectUrl;
  if (redirectUrl === undefined) {
    redirectUrl = pageRootUrl();
  }

  const state = generateState();
  auth.setRedirectFragment(RedirectFragmentFields.State, state);
  auth.setRedirectFragment(RedirectKeys.Type, redirectType);

  return { redirectUrl, state };
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
    throw new RangeError("invalid user auth data provided: " + data);
  }

  const [accessToken, refreshToken, userId, deviceId] = parts;
  return new AuthInfo(userId, deviceId, accessToken, refreshToken);
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
