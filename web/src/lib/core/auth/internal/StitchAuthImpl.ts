import {
  CoreStitchAuth,
  CoreStitchUser,
  DeviceFields,
  StitchAppClientInfo,
  StitchAuthRoutes,
  StitchCredential,
  StitchRequestClient,
  StitchUserFactory,
  Storage,
  StitchAuthRequestClient
} from "stitch-core";

import { detect } from "detect-browser";
import Stitch from "../../Stitch";
import AuthProviderClientFactory from "../providers/internal/AuthProviderClientFactory";
import NamedAuthProviderClientFactory from "../providers/internal/NamedAuthProviderClientFactory";
import StitchAuth from "../StitchAuth";
import StitchAuthListener from "../StitchAuthListener";
import StitchUser from "../StitchUser";
import StitchUserFactoryImpl from "./StitchUserFactoryImpl";

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
}
