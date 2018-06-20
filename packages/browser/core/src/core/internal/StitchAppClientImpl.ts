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
  StitchAppClientConfiguration,
  StitchAppClientInfo,
  StitchAppRoutes,
  StitchRequestClient
} from "mongodb-stitch-core-sdk";
import NamedServiceClientFactory from "../../services/internal/NamedServiceClientFactory";
import ServiceClientFactory from "../../services/internal/ServiceClientFactory";
import StitchServiceImpl from "../../services/internal/StitchServiceImpl";
import StitchAuthImpl from "../auth/internal/StitchAuthImpl";
import StitchAppClient from "../StitchAppClient";

export default class StitchAppClientImpl implements StitchAppClient {
  public readonly auth: StitchAuthImpl;

  private readonly coreClient: CoreStitchAppClient;
  private readonly info: StitchAppClientInfo;
  private readonly routes: StitchAppRoutes;

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
    const requestClient = new StitchRequestClient(
      config.baseURL,
      config.transport
    );
    this.auth = new StitchAuthImpl(
      requestClient,
      this.routes.authRoutes,
      config.storage,
      this.info
    );
    this.coreClient = new CoreStitchAppClient(this.auth, this.routes);
  }

  public getServiceClient<T>(
    factory: ServiceClientFactory<T> | NamedServiceClientFactory<T>,
    serviceName?: string
  ): T {
    if (isServiceClientFactory(factory)) {
      return factory.getClient(
        new StitchServiceImpl(this.auth, this.routes.serviceRoutes, ""),
        this.info
      );
    } else {
      return factory.getNamedClient(
        new StitchServiceImpl(
          this.auth,
          this.routes.serviceRoutes,
          serviceName!
        ),
        this.info
      );
    }
  }

  public callFunction(name: string, args: any[]): Promise<any> {
    return this.coreClient.callFunctionInternal(name, args);
  }
}

function isServiceClientFactory<T>(
  factory: ServiceClientFactory<T> | NamedServiceClientFactory<T>
): factory is ServiceClientFactory<T> {
  return (<ServiceClientFactory<T>>factory).getClient !== undefined;
}
