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
  FetchTransport,
  StitchAppClientConfiguration
} from "mongodb-stitch-core-sdk";
import LocalStorage from "./internal/common/LocalStorage";
import StitchAppClientImpl from "./internal/StitchAppClientImpl";
import StitchAppClient from "./StitchAppClient";

const DEFAULT_BASE_URL = "https://stitch.mongodb.com";
const TAG = "Stitch";
const appClients: { [key: string]: StitchAppClientImpl } = {};

export default class Stitch {
  public static get defaultAppClient(): StitchAppClient {
    if (Stitch.defaultClientAppId === undefined) {
      throw new Error("default app client has not yet been initialized/set");
    }
    return appClients[Stitch.defaultClientAppId];
  }

  public static getAppClient(clientAppId: string): StitchAppClient {
    if (appClients[clientAppId] !== undefined) {
      throw new Error(
        `client for app '${clientAppId}' has not yet been initialized`
      );
    }
    return appClients[clientAppId];
  }

  public static hasAppClient(clientAppId: string): boolean {
    return appClients[clientAppId] !== undefined;
  }

  public static initializeDefaultAppClient(
    clientAppId: string,
    config: StitchAppClientConfiguration = new StitchAppClientConfiguration.Builder().build()
  ): StitchAppClient {
    if (clientAppId === undefined || clientAppId === "") {
      throw new Error("clientAppId must be set to a non-empty string");
    }
    if (Stitch.defaultClientAppId != null) {
      throw new Error(
        `default app can only be set once; currently set to '${
          Stitch.defaultClientAppId
        }'`
      );
    }
    const client = Stitch.initializeAppClient(clientAppId, config);
    Stitch.defaultClientAppId = clientAppId;
    return client;
  }

  public static initializeAppClient(
    clientAppId: string,
    config: StitchAppClientConfiguration = new StitchAppClientConfiguration.Builder().build()
  ): StitchAppClient {
    if (clientAppId === undefined || clientAppId === "") {
      throw new Error("clientAppId must be set to a non-empty string");
    }

    if (appClients[clientAppId] !== undefined) {
      throw new Error(
        `client for app '${
          clientAppId
        }' has already been initialized`
      );
    }

    const builder = config.builder();
    if (builder.storage === undefined) {
      builder.withStorage(new LocalStorage(clientAppId));
    }
    if (builder.transport == null) {
      builder.withTransport(new FetchTransport());
    }
    if (builder.baseURL == null || builder.baseURL === "") {
      builder.withBaseURL(DEFAULT_BASE_URL);
    }
    if (
      builder.localAppName == null ||
      builder.localAppName === ""
    ) {
      builder.withLocalAppName(Stitch.localAppName);
    }
    if (
      builder.localAppVersion == null ||
      builder.localAppVersion === ""
    ) {
      builder.withLocalAppVersion(Stitch.localAppVersion);
    }

    const client = new StitchAppClientImpl(clientAppId, builder.build());
    appClients[clientAppId] = client;
    return client;
  }

  private static localAppVersion: string;
  private static defaultClientAppId: string;
  private static localAppName: string;
}
