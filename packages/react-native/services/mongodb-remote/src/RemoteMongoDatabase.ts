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
import RemoteMongoCollection from "./RemoteMongoCollection";

/**
 * RemoteMongoDatabase provides access to a MongoDB database.
 * 
 * It is instantiated by [[RemoteMongoClient]].
 *
 * Once instantiated, it can be used to access a [[RemoteMongoCollection]]
 * for reading and writing data.
 *
 * ### Example
 *
 * Here's how to access a database and one of its collections:
 * ```
 * // Instantiate the Stitch client
 * const stitchClient = Stitch.initializeDefaultAppClient('your-stitch-app-id')
 *
 * // Get a client of the Remote Mongo Service for database access
 * const mongoClient = stitchClient.getServiceClient(RemoteMongoClient.factory, 'mongodb-atlas')
 *
 * // Retrieve a database object
 * const exampleDb = mongoClient.db('example-db')
 * 
 * // Retrieve the collection in the database
 * const exampleCollection = db.collection('example-collection')
 * ```
 *
 * ### See also
 * - [[RemoteMongoClient]]
 * - [[RemoteMongoCollection]]
 * 
 */
export default interface RemoteMongoDatabase {
  /**
   * Gets the name of the database.
   *
   * @return the database name
   */
  readonly name: string;

  /**
   * Gets a collection.
   *
   * @param name the name of the collection to return
   * @return the collection
   */
  collection<T>(name: string, codec?: Codec<T>): RemoteMongoCollection<T>;
}
