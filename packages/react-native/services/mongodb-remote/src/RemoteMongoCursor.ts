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

/**
 * RemoteMongoCursor is an iterator over documents, which allows asynchronous traversal.
 *
 * A RemoteMongoCursor can be obtained from the result of a `find` or `aggregate` operation
 * on a [[RemoteMongoCollection]] by calling [[RemoteMongoReadOperation.iterator]].
 * 
 * @see
 * - [[RemoteMongoCollection.find]]
 * - [[RemoteMongoCollection.aggregate]]
 * - [[RemoteMongoReadOperation]]
 * - [[RemoteMongoReadOperation.iterator]]
 */
export default class RemoteMongoCursor<T> {
  constructor(
    private readonly proxy: Iterator<T>,
  ) {}

  /**
   * Retrieves the next document in this cursor, potentially fetching from the 
   * server.
   */
  public next(): Promise<T | undefined> {
    return Promise.resolve(this.proxy.next().value);
  }
}
