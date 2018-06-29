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

import { ensureDirSync } from "fs-extra"
import {
  FetchTransport,
  StitchAppClientConfiguration
} from "mongodb-stitch-core-sdk";
import { homedir } from "os"
import { isAbsolute, join, resolve, sep } from "path"
import FileStorage from "./internal/common/FileStorage";
import StitchAppClientImpl from "./internal/StitchAppClientImpl";
import StitchAppClient from "./StitchAppClient";

const DEFAULT_BASE_URL = "https://stitch.mongodb.com";
const DEFAULT_STITCH_DIR = ".stitch/apps";
const appClients: { [key: string]: StitchAppClientImpl } = {};

/**
 * Singleton class with static utility functions for initializing the MongoDB 
 * Stitch Browser SDK, and for retrieving a {@link StitchAppClient}.
 */
export default class Stitch {
  /**
   * Retrieves the default StitchAppClient associated with the application.
   */
  public static get defaultAppClient(): StitchAppClient {
    if (Stitch.defaultClientAppId === undefined) {
      throw new Error("default app client has not yet been initialized/set");
    }
    return appClients[Stitch.defaultClientAppId];
  }

  /**
   * Retrieves the StitchAppClient associated with the specified client app id.
   * @param clientAppId The client app id of the desired app client.
   */
  public static getAppClient(clientAppId: string): StitchAppClient {
    if (appClients[clientAppId] !== undefined) {
      throw new Error(
        `client for app '${clientAppId}' has not yet been initialized`
      );
    }
    return appClients[clientAppId];
  }

  /**
   * Returns whether or not a StitchAppClient has been initialized for the
   * specified clientAppId
   * 
   * @param clientAppId The client app id to check for.
   */
  public static hasAppClient(clientAppId: string): boolean {
    return appClients[clientAppId] !== undefined;
  }

  /**
   * Initializes the default StitchAppClient associated with the application.
   * 
   * @param clientAppId The desired clientAppId for the client.
   * @param config Additional configuration options (optional).
   */
  public static initializeDefaultAppClient(
    clientAppId: string,
    config: StitchAppClientConfiguration = new StitchAppClientConfiguration.Builder().build()
  ): StitchAppClient {
    if (clientAppId === undefined || clientAppId === "") {
      throw new Error("clientAppId must be set to a non-empty string");
    }
    if (Stitch.defaultClientAppId !== undefined) {
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

  /**
   * Initializes a new, non-default StitchAppClient associated with the 
   * application.
   * 
   * @param clientAppId The desired clientAppId for the client.
   * @param config Additional configuration options (optional).
   */
  public static initializeAppClient(
    clientAppId: string,
    config: StitchAppClientConfiguration = new StitchAppClientConfiguration.Builder().build()
  ): StitchAppClient {
    if (clientAppId === undefined || clientAppId === "") {
      throw new Error("clientAppId must be set to a non-empty string");
    }

    if (appClients[clientAppId] !== undefined) {
      throw new Error(
        `client for app '${clientAppId}' has already been initialized`
      );
    }

    const builder = config.builder();
    if (builder.dataDirectory === undefined || builder.dataDirectory === "") {
      const dataPath = join(homedir(), DEFAULT_STITCH_DIR, clientAppId);
      ensureDirSync(dataPath);
      builder.withDataDirectory(dataPath);
    }
    if (builder.storage === undefined) {
      builder.withStorage(new FileStorage(builder.dataDirectory));
    }
    if (builder.transport === undefined) {
      builder.withTransport(new FetchTransport());
    }
    if (builder.baseUrl === undefined || builder.baseUrl === "") {
      builder.withBaseUrl(DEFAULT_BASE_URL);
    }
    if (builder.localAppName === undefined || builder.localAppName === "") {
      builder.withLocalAppName(Stitch.localAppName);
    }
    if (
      builder.localAppVersion === undefined ||
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
