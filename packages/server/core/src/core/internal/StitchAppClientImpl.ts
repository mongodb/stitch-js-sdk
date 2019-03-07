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
  CoreStitchAppClient,
  CoreStitchServiceClientImpl,
  StitchAppClientConfiguration,
  StitchAppClientInfo,
  StitchAppRequestClient,
  StitchAppRoutes,
  CoreStitchServiceClient,
  RebindEvent,
  AuthRebindEvent,
  AuthEventKind
} from "mongodb-stitch-core-sdk";

import NamedServiceClientFactory from "../../services/internal/NamedServiceClientFactory";
import ServiceClientFactory from "../../services/internal/ServiceClientFactory";
import StitchServiceClientImpl from "../../services/internal/StitchServiceClientImpl";
import StitchServiceClient from "../../services/StitchServiceClient";
import StitchAuthImpl from "../auth/internal/StitchAuthImpl";
import StitchAppClient from "../StitchAppClient";
import StitchAuth from "../auth/StitchAuth";
import StitchUser from "../auth/StitchUser";

/** @hidden */
export default class StitchAppClientImpl implements StitchAppClient {
  public readonly auth: StitchAuthImpl;

  private readonly coreClient: CoreStitchAppClient;
  private readonly info: StitchAppClientInfo;
  private readonly routes: StitchAppRoutes;

  private serviceClients: CoreStitchServiceClient[];

  public constructor(
    clientAppId: string,
    config: StitchAppClientConfiguration
  ) {
    this.info = new StitchAppClientInfo(
      clientAppId,
      config.dataDirectory,
      config.localAppName,
      config.localAppVersion
    );
    this.routes = new StitchAppRoutes(this.info.clientAppId);
    const requestClient = new StitchAppRequestClient(
      clientAppId,
      config.baseUrl,
      config.transport
    );
    this.auth = new StitchAuthImpl(
      requestClient,
      this.routes.authRoutes,
      config.storage,
      this.info
    );
    this.coreClient = new CoreStitchAppClient(this.auth, this.routes);
    this.serviceClients = [];
    this.auth.addSynchronousAuthListener(this);
  }

  public getServiceClient<T>(
    factory: ServiceClientFactory<T> | NamedServiceClientFactory<T>,
    serviceName?: string
  ): T {
    if (isServiceClientFactory(factory)) {
      let serviceClient = new CoreStitchServiceClientImpl(
        this.auth, this.routes.serviceRoutes, ""
      );
      this.bindServiceClient(serviceClient);
      return factory.getClient(serviceClient, this.info);
    } else {
      let serviceClient = new CoreStitchServiceClientImpl(
        this.auth,
        this.routes.serviceRoutes,
        serviceName!
      );
      this.bindServiceClient(serviceClient);
      return factory.getNamedClient(
        serviceClient,
        this.info
      );
    }
  }

  public getGeneralServiceClient(serviceName: string): StitchServiceClient {
    let serviceClient = new CoreStitchServiceClientImpl(
      this.auth,
      this.routes.serviceRoutes,
      serviceName
    );
    this.bindServiceClient(serviceClient);
    return new StitchServiceClientImpl(
      serviceClient
    );
  }

  public callFunction(name: string, args: any[]): Promise<any> {
    return this.coreClient.callFunction(name, args);
  }

  private bindServiceClient(coreStitchServiceClient: CoreStitchServiceClient) {
    this.serviceClients.push(coreStitchServiceClient);
  }

  private onRebindEvent(rebindEvent: RebindEvent) {
    this.serviceClients.forEach(serviceClient => {
      serviceClient.onRebindEvent(rebindEvent);
    })
  }

  // note: this is the only rebind event we care about for JS. if we add 
  // services in the future, or update existing services in such a way that 
  // they'll need to rebind on other types of events, those handlers should be
  // added to this file.
  public onActiveUserChanged(
    _: StitchAuth, 
    currentActiveUser: StitchUser | undefined, 
    previousActiveUser: StitchUser | undefined
  ) {
    this.onRebindEvent(new AuthRebindEvent({
      kind: AuthEventKind.ActiveUserChanged,
      currentActiveUser, 
      previousActiveUser
    }))
  }

  public close() {
    this.auth.close();
  }
}

function isServiceClientFactory<T>(
  factory: ServiceClientFactory<T> | NamedServiceClientFactory<T>
): factory is ServiceClientFactory<T> {
  return (factory as ServiceClientFactory<T>).getClient !== undefined;
}
