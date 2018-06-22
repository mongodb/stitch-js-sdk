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

import { CoreStitchServiceClient } from "mongodb-stitch-core-sdk";
import CoreRemoteMongoClient from "./CoreRemoteMongoClient";
import CoreRemoteMongoDatabase from "./CoreRemoteMongoDatabase";
import CoreRemoteMongoDatabaseImpl from "./CoreRemoteMongoDatabaseImpl";

/** @hidden */
export default class CoreRemoteMongoClientImpl
  implements CoreRemoteMongoClient {
  public constructor(public readonly service: CoreStitchServiceClient) {}

  /**
   * Gets a `CoreRemoteMongoDatabase` instance for the given database name.
   *
   * - parameter name: the name of the database to retrieve
   */
  public db(name: string): CoreRemoteMongoDatabase {
    return new CoreRemoteMongoDatabaseImpl(name, this.service);
  }
}
