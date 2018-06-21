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

import { Codec } from "mongodb-stitch-core-sdk";
import { CoreRemoteMongoDatabase } from "mongodb-stitch-core-services-mongodb-remote";
import RemoteMongoCollection from "../RemoteMongoCollection";
import RemoteMongoCollectionImpl from "./RemoteMongoCollectionImpl";

/**
 * @hidden
 * The RemoteMongoDatabase interface.
 */
export default class RemoteMongoDatabaseImpl {
  public readonly name = this.proxy.name;

  public constructor(private readonly proxy: CoreRemoteMongoDatabase) {}

  /**
   * Gets a collection.
   *
   * @param name the name of the collection to return
   * @return the collection
   */
  public collection<T>(
    name: string,
    codec?: Codec<T>
  ): RemoteMongoCollection<T> {
    return new RemoteMongoCollectionImpl(
      this.proxy.collection(name, codec),
      codec
    );
  }
}
