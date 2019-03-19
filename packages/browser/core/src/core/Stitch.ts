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
  StitchAppClientConfiguration
} from "mongodb-stitch-core-sdk";
import LocalStorage from "./internal/common/LocalStorage";
import BrowserFetchStreamTransport from "./internal/net/BrowserFetchStreamTransport";
import BrowserFetchTransport from "./internal/net/BrowserFetchTransport";
import StitchAppClientImpl from "./internal/StitchAppClientImpl";
import StitchAppClient from "./StitchAppClient";

const DEFAULT_BASE_URL = "https://stitch.mongodb.com";
let appClients: { [key: string]: StitchAppClientImpl } = {};

/**
 * Singleton class with static utility functions for initializing a [[StitchAppClient]].
 *
 * Typically, the [[Stitch.initializeDefaultAppClient]] method is all you need 
 * to instantiate the client:
 * 
 * ```
 * const client = Stitch.initializeDefaultAppClient('your-stitch-app-id')
 * ```
 *
 * For custom configurations, see [[Stitch.initializeAppClient]] and [[StitchAppClientConfiguration]].
 *
 * @see
 * - [[StitchAppClient]]
 */
export default class Stitch {
  /**
   * Retrieves the default [[StitchAppClient]] associated with the application.
   */
  public static get defaultAppClient(): StitchAppClient {
    if (Stitch.defaultClientAppId === undefined) {
      throw new Error("default app client has not yet been initialized/set");
    }
    return appClients[Stitch.defaultClientAppId];
  }

  /**
   * Retrieves the [[StitchAppClient]] associated with the specified client app id.
   * @param clientAppId The client app id of the desired app client.
   */
  public static getAppClient(clientAppId: string): StitchAppClient {
    if (appClients[clientAppId] === undefined) {
      throw new Error(
        `client for app '${clientAppId}' has not yet been initialized`
      );
    }
    return appClients[clientAppId];
  }

  /**
   * Returns whether or not a [[StitchAppClient]] has been initialized for the
   * specified clientAppId.
   * 
   * @param clientAppId The client app id to check for.
   */
  public static hasAppClient(clientAppId: string): boolean {
    return appClients[clientAppId] !== undefined;
  }

  /**
   * Initializes the default [[StitchAppClient]] associated with the application.
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
   * Initializes a new, non-default [[StitchAppClient]] associated with the 
   * application.
   * 
   * @param clientAppId The desired clientAppId for the client.
   * @param config Additional [[StitchAppClientConfiguration]] options (optional).
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

    const builder = config.builder ? config.builder() : new StitchAppClientConfiguration.Builder(config);
    if (builder.storage === undefined) {
      builder.withStorage(new LocalStorage(clientAppId));
    }
    if (builder.transport === undefined) {
      /*
       * Use the EventSource-streaming compatible transport if the browser
       * supports it, otherwise use a vanilla FetchTransport that will fail on
       * attempting to open a stream.
       */
      /* tslint:disable:no-string-literal */
      if (window["EventSource"]) {
        builder.withTransport(new BrowserFetchStreamTransport());  
      } else {
        builder.withTransport(new BrowserFetchTransport());
      }
      /* tslint:enable:no-string-literal */
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

  /**
   * This will clear out all initialized app clients. This method is mainly for
   * debugging, simulating an application restart, as it will clear all clients
   * stored in memory
   */
  public static clearApps() {
    appClients = {};
  }

  private static localAppVersion: string;
  private static defaultClientAppId: string;
  private static localAppName: string;
}
