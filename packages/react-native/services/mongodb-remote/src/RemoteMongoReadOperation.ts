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

import { CoreRemoteMongoReadOperation } from "mongodb-stitch-core-services-mongodb-remote";
import RemoteMongoCursor from "./RemoteMongoCursor";

/**
 * Represents a `find` or `aggregate` operation against a [[RemoteMongoCollection]].
 * 
 * The methods in this class execute the operation and retrieve the results,
 * either as an [[iterator]] or all in one array with [[toArray]].
 * 
 * @see
 * - [[RemoteMongoCollection]]
 * - [[RemoteMongoCollection.find]]
 * - [[RemoteMongoCollection.aggregate]]
 * - [[RemoteFindOptions]]
 * - [CRUD Snippets](https://docs.mongodb.com/stitch/mongodb/crud-snippets/#find)
 */
export default class RemoteMongoReadOperation<T> {
  /** @hidden */
  constructor(
    /** @hidden */
    private readonly proxy: CoreRemoteMongoReadOperation<T>
  ) {}

  /**
   * Executes the operation and returns the first document in the result.
   */
  public first(): Promise<T | undefined> {
    return this.proxy.first();
  }

  /**
   * Executes the operation and returns the result as an array.
   */
  public toArray(): Promise<T[]> {
    return this.proxy.toArray();
  }

  /**
   * Executes the operation and returns the result as an array.
   * @deprecated Use toArray instead
   */
  public asArray(): Promise<T[]> {
    return this.toArray();
  }

  /**
   * Executes the operation and returns a cursor to its resulting documents.
   */
  public iterator(): Promise<RemoteMongoCursor<T>> {
    return this.proxy.iterator().then(res => new RemoteMongoCursor(res));
  }
}
