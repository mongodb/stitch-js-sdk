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

import { Codec, CoreStitchServiceClient } from "mongodb-stitch-core-sdk";
import CoreRemoteMongoCollection from "./CoreRemoteMongoCollection";
import CoreRemoteMongoCollectionImpl from "./CoreRemoteMongoCollectionImpl";
import CoreRemoteMongoDatabase from "./CoreRemoteMongoDatabase";

/** @hidden */
export default class CoreRemoteMongoDatabaseImpl
  implements CoreRemoteMongoDatabase {
  public constructor(
    public readonly name: string,
    private readonly service: CoreStitchServiceClient
  ) {}

  /**
   * Gets a collection.
   *
   * - parameter name: the name of the collection to return
   * - returns: the collection
   */
  public collection<T>(
    name: string,
    codec?: Codec<T>
  ): CoreRemoteMongoCollection<T> {
    return new CoreRemoteMongoCollectionImpl(
      name,
      this.name,
      this.service,
      codec
    );
  }
}
