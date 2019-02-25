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
  AuthEvent, 
  AuthEventKind,
  AuthInfo,
  CoreStitchAuth,
  CoreStitchUser,
  DeviceFields,
  StitchAppClientInfo,
  StitchAuthRoutes,
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
import StitchAuth from "../StitchAuth";
import StitchAuthListener from "../StitchAuthListener";
import StitchUser from "../StitchUser";
import StitchUserFactoryImpl from "./StitchUserFactoryImpl";

/** @hidden */
export default class StitchAuthImpl extends CoreStitchAuth<StitchUser>
  implements StitchAuth {
  private readonly listeners: Set<StitchAuthListener> = new Set();
  private readonly synchronousListeners: Set<StitchAuthListener> = new Set();

  /**
   * Construct a new StitchAuth implementation
   *
   * @param requestClient StitchRequestClient that does request
   * @param authRoutes pathnames to call for authentication routes
   * @param authStorage internal storage
   * @param appInfo info about the current stitch app
   */
  public constructor(
    requestClient: StitchRequestClient,
    authRoutes: StitchAuthRoutes,
    authStorage: Storage,
    private readonly appInfo: StitchAppClientInfo
  ) {
    super(requestClient, authRoutes, authStorage);
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

  public linkWithCredential(
    user: CoreStitchUser,
    credential: StitchCredential
  ): Promise<StitchUser> {
    return super.linkUserWithCredentialInternal(user, credential);
  }

  public logout(): Promise<void> {
    return super.logoutInternal();
  }

  public logoutUserWithId(userId: string): Promise<void> {
    return super.logoutUserWithIdInternal(userId);
  }

  public removeUser(): Promise<void> {
    return super.removeUserInternal();
  }

  public removeUserWithId(userId: string): Promise<void> {
    return super.removeUserWithIdInternal(userId);
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

    info[DeviceFields.PLATFORM] = "js-server";
    info[DeviceFields.PLATFORM_VERSION] = process.version;
    info[DeviceFields.SDK_VERSION] = version;

    return info;
  }

  public addAuthListener(listener: StitchAuthListener) {
    this.listeners.add(listener);

    // Trigger the ListenerRegistered event in case some event happens and
    // This caller would miss out on this event other wise.

    // Dispatch a legacy deprecated auth event
    this.onAuthEvent(listener);

    // Dispatch a new style auth event
    this.dispatchAuthEvent({
      kind: AuthEventKind.ListenerRegistered,
    });
  }

  public addSynchronousAuthListener(listener: StitchAuthListener) {
    this.listeners.add(listener);

    // Trigger the ListenerRegistered event in case some event happens and
    // This caller would miss out on this event other wise.

    // Dispatch a legacy deprecated auth event
    this.onAuthEvent(listener);

    // Dispatch a new style auth event
    this.dispatchAuthEvent({
      kind: AuthEventKind.ListenerRegistered,
    });
  }

  public removeAuthListener(listener: StitchAuthListener) {
    this.listeners.delete(listener);
  }

  /** 
   * Dispatch method for the deprecated auth listener method onAuthEvent.
   */
  public onAuthEvent(listener?: StitchAuthListener) {
    if (listener) {
      const _ = new Promise(resolve => {
        if (listener.onAuthEvent) {
          listener.onAuthEvent(this);  
        }
        resolve(undefined);
      });
    } else {
      this.listeners.forEach(one => {
        this.onAuthEvent(one);
      });
    }
  }

  /**
   * Dispatch method for the new auth listener methods.
   * @param event the discriminated union representing the auth event
   */
  public dispatchAuthEvent(event: AuthEvent<StitchUser>) {
    switch(event.kind) {
      case AuthEventKind.ActiveUserChanged:
        this.dispatchBlockToListeners((listener: StitchAuthListener) => {
          if (listener.onActiveUserChanged) {
            listener.onActiveUserChanged(
              this,
              event.currentActiveUser,
              event.previousActiveUser
            );  
          }
        });
        break;
      case AuthEventKind.ListenerRegistered:
        this.dispatchBlockToListeners((listener: StitchAuthListener) => {
          if (listener.onListenerRegistered) {
            listener.onListenerRegistered(this);  
          }
        });
        break;
      case AuthEventKind.UserAdded:
        this.dispatchBlockToListeners((listener: StitchAuthListener) => {
          if (listener.onUserAdded) {
            listener.onUserAdded(this, event.addedUser);  
          }
        });
        break;
      case AuthEventKind.UserLinked:
        this.dispatchBlockToListeners((listener: StitchAuthListener) => {
          if (listener.onUserLinked) {
            listener.onUserLinked(this, event.linkedUser);
          }
        })
        break;
      case AuthEventKind.UserLoggedIn:
        this.dispatchBlockToListeners((listener: StitchAuthListener) => {
          if (listener.onUserLoggedIn) {
            listener.onUserLoggedIn(
              this,
              event.loggedInUser
            );
          }
        });
        break;
      case AuthEventKind.UserLoggedOut:
        this.dispatchBlockToListeners((listener: StitchAuthListener) => {
          if (listener.onUserLoggedOut) {
            listener.onUserLoggedOut(
              this, 
              event.loggedOutUser
            );  
          }
        });
        break;
      case AuthEventKind.UserRemoved:
        this.dispatchBlockToListeners((listener: StitchAuthListener) => {
          if (listener.onUserRemoved) {
            listener.onUserRemoved(this, event.removedUser);
          }
        });
        break;
      default:
        /* 
         * compiler trick to force this switch to be exhaustive. if the above
         * switch statement doesn't check all AuthEventKinds, event will not
         * be of type never
         */
        return this.assertNever(event);
    }
  }

  /**
   * Utility function used to force the compiler to enforce an exhaustive 
   * switch statment in dispatchAuthEvent at compile-time.
   * @see https://www.typescriptlang.org/docs/handbook/advanced-types.html
   */
  private assertNever(x: never): never {
    throw new Error("unexpected object: " + x);
  }

  /**
   * Dispatches the provided block to all auth listeners, including the 
   * synchronous and asynchronous ones.
   * @param block The block to dispatch to listeners.
   */
  private dispatchBlockToListeners(block: (StitchAuthListener) => void) {
    // Dispatch to all synchronous listeners
    this.synchronousListeners.forEach(block);

    // Dispatch to all asynchronous listeners
    this.listeners.forEach(listener => {
      const _ = new Promise(resolve => {
        block(listener);
        resolve(undefined);
      })
    });
  }
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
