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
  NamedServiceClientFactory,
  StitchServiceClient
} from "mongodb-stitch-react-native-core";
import { StitchAppClientInfo } from "mongodb-stitch-core-sdk";
import { CoreRemoteMongoClientImpl } from "mongodb-stitch-core-services-mongodb-remote";
import RemoteMongoClientImpl from "./internal/RemoteMongoClientImpl";
import RemoteMongoDatabase from "./RemoteMongoDatabase";

/**
 * A client which can be used to get database and collection objects which can 
 * be used to interact with MongoDB data via the Stitch MongoDB service.
 */
export interface RemoteMongoClient {
  /**
   * Gets a {@link RemoteMongoDatabase} instance for the given database name.
   *
   * @param name the name of the database to retrieve
   * @return a {@code RemoteMongoDatabase} representing the specified database
   */
  db(name: string): RemoteMongoDatabase;
}

export namespace RemoteMongoClient {
  export const factory: NamedServiceClientFactory<RemoteMongoClient> = new class
    implements NamedServiceClientFactory<RemoteMongoClient> {
    public getNamedClient(
      service: StitchServiceClient,
      client: StitchAppClientInfo
    ): RemoteMongoClient {
      return new RemoteMongoClientImpl(new CoreRemoteMongoClientImpl(service));
    }
  }();
}
