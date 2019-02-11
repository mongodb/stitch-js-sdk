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

import { NamedServiceClientFactory } from "mongodb-stitch-browser-core";
import { 
  CoreStitchServiceClient, 
  StitchAppClientInfo 
} from "mongodb-stitch-core-sdk";
import { CoreRemoteMongoClientImpl } from "mongodb-stitch-core-services-mongodb-remote";
import RemoteMongoClientImpl from "./internal/RemoteMongoClientImpl";
import RemoteMongoDatabase from "./RemoteMongoDatabase";

/**
 * The RemoteMongoClient can be used to get database and collection objects
 * for interacting with MongoDB data via the Stitch MongoDB service.
 *
 * Service clients are created with [[StitchAppClient.getServiceClient]] by passing
 * [[RemoteMongoClient.factory]] and the "Stitch Service Name" found under _Clusters_
 * in the [Stitch control panel](https://stitch.mongodb.com)
 * ("mongodb-atlas" by default).
 *
 * Once the RemoteMongoClient is instantiated, you can use the [[db]] method to access
 * a [[RemoteMongoDatabase]]. A RemoteMongoDatabase will then provide access to
 * a [[RemoteMongoCollection]], where you can read and write data.
 *
 * Note: The client needs to log in (at least anonymously) to use the database.
 * See [[StitchAuth]].
 *
 * @see
 * - [[StitchAppClient]]
 * - [[RemoteMongoDatabase]]
 */
export interface RemoteMongoClient {
  /**
   * Gets a [[RemoteMongoDatabase]] instance for the given database name.
   *
   * @param name the name of the database to retrieve
   * @return a [[RemoteMongoDatabase]] representing the specified database
   */
  db(name: string): RemoteMongoDatabase;
}

export namespace RemoteMongoClient {
  export const factory: NamedServiceClientFactory<RemoteMongoClient> = new class
    implements NamedServiceClientFactory<RemoteMongoClient> {
    public getNamedClient(
      service: CoreStitchServiceClient,
      client: StitchAppClientInfo
    ): RemoteMongoClient {
      return new RemoteMongoClientImpl(new CoreRemoteMongoClientImpl(service));
    }
  }();
}
