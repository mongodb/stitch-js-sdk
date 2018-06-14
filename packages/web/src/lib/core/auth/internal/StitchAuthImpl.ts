import {
  AuthInfo,
  CoreStitchAuth,
  CoreStitchUser,
  DeviceFields,
  GoogleAuthProvider,
  GoogleCredential,
  StitchAppClientInfo,
  StitchAuthRoutes,
  StitchCredential,
  StitchRequestClient,
  StitchUserFactory,
  Storage
} from "stitch-core";

import { detect } from "detect-browser";
import Stitch from "../../Stitch";
import AuthProviderClientFactory from "../providers/internal/AuthProviderClientFactory";
import NamedAuthProviderClientFactory from "../providers/internal/NamedAuthProviderClientFactory";
import StitchAuth from "../StitchAuth";
import StitchAuthListener from "../StitchAuthListener";
import StitchUser from "../StitchUser";
import StitchUserFactoryImpl from "./StitchUserFactoryImpl";

enum RedirectKeys {
  State = "state",
  RedirectProvider = "redirectProvider",
  StitchError = "stitchError",
  StitchLink = "stitchLink",
  UserAuth = "userAuth",
}

interface ParsedRedirectFragment {
  ua?: AuthInfo,
  found: boolean
  stateValid: boolean,
  lastError?: string
}

export default class StitchAuthImpl extends CoreStitchAuth<StitchUser>
  implements StitchAuth {
  private readonly appInfo: StitchAppClientInfo;
  private readonly listeners: Set<StitchAuthListener> = new Set();

  public constructor(
    requestClient: StitchRequestClient,
    authRoutes: StitchAuthRoutes,
    storage: Storage,
    appInfo: StitchAppClientInfo
  ) {
    super(requestClient, authRoutes, storage);
    this.appInfo = appInfo;
  }

  protected get userFactory(): StitchUserFactory<StitchUser> {
    return new StitchUserFactoryImpl(this);
  }

  public getProviderClient<ClientT>(
    provider: AuthProviderClientFactory<ClientT>
  ): ClientT {
    return provider.getClient(this, this.requestClient, this.authRoutes);
  }

  public getProviderClientWithName<T>(
    provider: NamedAuthProviderClientFactory<T>,
    providerName: string
  ): T {
    return provider.getClient(
      providerName,
      this.requestClient,
      this.authRoutes
    );
  }

  public loginWithOAuth(type: string) {
    switch (type) {
      case GoogleAuthProvider.TYPE: {

        break;
      }
    }
  }

  public loginWithCredential(
    credential: StitchCredential
  ): Promise<StitchUser> {
    return super.loginWithCredentialInternal(credential);
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

    // TODO: STITCH-1528 JS SDK: Read version of SDK dynamically
    info[DeviceFields.SDK_VERSION] = "4.0.0";

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

  private pageRootUrl() {
    return [window.location.protocol, '//', window.location.host, window.location.pathname].join('');
  }

  private unmarshallUserAuth(data): AuthInfo {
    const parts = data.split('$');
    if (parts.length !== 4) {
      throw new RangeError('invalid user auth data provided: ' + data);
    }

    return new AuthInfo(parts[2], parts[3], parts[0], parts[1]);
  }

  private parseRedirectFragment(fragment, ourState) {
    // After being redirected from oauth, the URL will look like:
    // https://todo.examples.stitch.mongodb.com/#_stitch_state=...&_stitch_ua=...
    // This function parses out stitch-specific tokens from the fragment and
    // builds an object describing the result.
    const vars = fragment.split('&');
    const result: ParsedRedirectFragment = { found: false, stateValid: false }

    let shouldBreak = false;
    for (let i = 0; i < vars.length && !shouldBreak; ++i) {
      const pairParts = vars[i].split('=');
      const pairKey = decodeURIComponent(pairParts[0]);
      switch (pairKey) {
      case RedirectKeys.StitchError:
        result.lastError = decodeURIComponent(pairParts[1]);
        result.found = true;
        shouldBreak = true;
        break;
      case RedirectKeys.UserAuth:
        try {
          result.ua = this.unmarshallUserAuth(decodeURIComponent(pairParts[1]));
          result.found = true;
        } catch (e) {
          result.lastError = e;
        }
        continue;
      case RedirectKeys.StitchLink:
        result.found = true;
        continue;
      case RedirectKeys.State:
        result.found = true;
        const theirState = decodeURIComponent(pairParts[1]);
        if (ourState && ourState === theirState) {
          result.stateValid = true;
        }
        continue;
      default: continue;
      }
    }

    return result;
  }

  private handleRedirect() {
    if (typeof (window) === 'undefined') {
      // This means we're running in some environment other
      // than a browser - so handling a redirect makes no sense here.
      return;
    }

    if (!window.location || !window.location.hash) {
      return;
    }

    const ourState = this.storage.get(RedirectKeys.State)
    const redirectProvider  = this.storage.get(RedirectKeys.RedirectProvider)

    const redirectFragment = window.location.hash.substring(1);
    const redirectState = this.parseRedirectFragment(redirectFragment, ourState);
    if (redirectState.lastError || (redirectState.found && !redirectProvider)) {
      console.error(`StitchClient: error from redirect: ${redirectState.lastError ?
      redirectState.lastError : 'provider type not set'}`);
      this._error = redirectState.lastError;
      window.history.replaceState(null, '', this.pageRootUrl());
      return Promise.reject();
    }

    if (!redirectState.found) {
      return;
      }

    this.storage.remove(RedirectKeys.State),
    this.storage.remove(RedirectKeys.RedirectProvider)

    if (!redirectState.stateValid) {
      console.error('StitchClient: state values did not match!');
      window.history.replaceState(null, '', this.pageRootUrl());
      return;
    }

    if (!redirectState.ua) {
      console.error('StitchClient: no UA value was returned from redirect!');
      return;
    }

    // If we get here, the state is valid - set auth appropriately.
    
    this.processLoginResponse(
      new GoogleCredential(""),
      redirectState.ua
    );

    window.history.replaceState(null, '', this.pageRootUrl())
  }
}
