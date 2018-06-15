import {
  AuthInfo,
  CoreStitchAuth,
  CoreStitchUser,
  DeviceFields,
  StitchAppClientInfo,
  StitchCredential,
  StitchRequestClient,
  StitchUserFactory,
  Storage
} from "stitch-core";

import { detect } from "detect-browser";
import AuthProviderClientFactory from "../providers/internal/AuthProviderClientFactory";
import NamedAuthProviderClientFactory from "../providers/internal/NamedAuthProviderClientFactory";
import StitchRedirectCredentialImpl from "../providers/internal/StitchRedirectCredentialImpl";
import StitchRedirectCredential from "../providers/StitchRedirectCredential";
import StitchAuth from "../StitchAuth";
import StitchAuthListener from "../StitchAuthListener";
import { StitchUser, StitchUserCodec } from "../StitchUser";
import StitchBrowserAppAuthRoutes from "./StitchBrowserAppAuthRoutes";
import StitchUserFactoryImpl from "./StitchUserFactoryImpl";

enum RedirectKeys {
  State = "_stitch_state",
  RedirectProvider = "redirectProvider",
  StitchError = "_stitch_error",
  StitchLink = "_stitch_link",
  Type = "_stitch_redirect_type",
  UserAuth = "_stitch_ua",
  LinkUser = "_stitch_link_user",
}

enum RedirectTypes {
  Link = "isLink",
  Login = "isLogin",
}

interface ParsedRedirectFragment {
  ua?: AuthInfo,
  found: boolean
  stateValid: boolean,
  lastError?: string
}

const version = "@VERSION@"

const alpha = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

export default class StitchAuthImpl extends CoreStitchAuth<StitchUser>
  implements StitchAuth {
  private readonly appInfo: StitchAppClientInfo;
  private readonly listeners: Set<StitchAuthListener> = new Set();
  private readonly browserAuthRoutes: StitchBrowserAppAuthRoutes;

  public constructor(
    requestClient: StitchRequestClient,
    authRoutes: StitchBrowserAppAuthRoutes,
    storage: Storage,
    appInfo: StitchAppClientInfo
  ) {
    super(requestClient, authRoutes, storage);
    this.appInfo = appInfo;
    this.browserAuthRoutes = authRoutes;
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

  public loginWithRedirect(credential: StitchRedirectCredential) {
    const { redirectUrl, state } = this.prepareRedirect(credential, RedirectTypes.Login);

    window.location.replace(
      this.browserAuthRoutes.getAuthProviderRedirectRoute(credential, redirectUrl, state, this.deviceInfo)
    )
  }

  public linkUserWithRedirect(user: StitchUser, credential: StitchRedirectCredential) {
    this.storage.set(
      RedirectKeys.LinkUser, 
      JSON.stringify(new StitchUserCodec(this).encode(user))
    );

    const { redirectUrl, state } = this.prepareRedirect(credential, RedirectTypes.Login);

    const link = this.browserAuthRoutes.getAuthProviderLinkRedirectRoute(credential, redirectUrl, state, this.deviceInfo)
    
    fetch(new Request(link + `&providerRedirectHeader=true`, {
      credentials: "include",
      headers: {
        "Authorization": "Bearer "+this.authInfo.accessToken,
      }
    })).then(response => {
      window.location.replace(response.headers.get("X-Stitch-Location")!);
    });
  }

  public hasRedirect(): boolean {
    return !!this.storage.get(RedirectKeys.State)
  }

  public handleRedirect(): Promise<StitchUser> {
    const cleanup = () => {
      this.storage.remove(RedirectKeys.State);
      this.storage.remove(RedirectKeys.RedirectProvider)
    }

    if (typeof (window) === 'undefined') {
      // This means we're running in some environment other
      // than a browser - so handling a redirect makes no sense here.
      cleanup();
      return Promise.reject();
    }

    if (!window.location || !window.location.hash) {
      cleanup();
      return Promise.reject();
    }

    const ourState = this.storage.get(RedirectKeys.State)
    const redirectProvider  = this.storage.get(RedirectKeys.RedirectProvider)
    
    cleanup();

    const redirectFragment = window.location.hash.substring(1);
    const redirectState = this.parseRedirectFragment(redirectFragment, ourState);

    if (redirectState.lastError || (redirectState.found && !redirectProvider)) {
      // this._error = redirectState.lastError;
      window.history.replaceState(null, '', this.pageRootUrl());
      return Promise.reject(`StitchClient: error from redirect: ${redirectState.lastError ?
        redirectState.lastError : 'provider type not set'}`);
    }

    if (!redirectState.found) {
      return Promise.reject(`no redirect state found`);
    }

    

    if (!redirectState.stateValid) {
      window.history.replaceState(null, '', this.pageRootUrl());
      return Promise.reject('StitchClient: state values did not match!');
    }

    if (!redirectState.ua) {
      return Promise.reject('StitchClient: no UA value was returned from redirect!');
    }

    // If we get here, the state is valid - set auth appropriately.
    
    return this.loginWithCredentialInternal(
      new StitchRedirectCredentialImpl(
        redirectProvider, redirectProvider, redirectState.ua!
      )
    ).then(user => {
      window.history.replaceState(null, '', this.pageRootUrl())
      return user;
    });
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

  // The state we generate is to be used for any kind of request where we will
  // complete an authentication flow via a redirect. We store the generate in
  // a local storage bound to the app's origin. This ensures that any time we
  // receive a redirect, there must be a state parameter and it must match
  // what we ourselves have generated. This state MUST only be sent to
  // a trusted Stitch endpoint in order to preserve its integrity. Stitch will
  // store it in some way on its origin (currently a cookie stored on this client)
  // and use that state at the end of an auth flow as a parameter in the redirect URI.
  private generateState() {
    let state = '';
    for (let i = 0; i < 64; ++i) {
      state += alpha.charAt(Math.floor(Math.random() * alpha.length));
    }
  
    return state;
  }

  private pageRootUrl() {
    return [window.location.protocol, '//', window.location.host, window.location.pathname].join('');
  }

  private prepareRedirect(
    credential: StitchRedirectCredential, 
    redirectType: RedirectTypes
  ): { redirectUrl: string, state: string } {
    this.storage.set(RedirectKeys.RedirectProvider, credential.providerType);
    let redirectUrl = credential.redirectUrl
    if (redirectUrl === undefined) {
      redirectUrl = this.pageRootUrl();
    }
  
    const state = this.generateState();
    this.storage.set(RedirectKeys.State, state);
    this.storage.set(RedirectKeys.Type, redirectType);

    return { redirectUrl, state }
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
}
