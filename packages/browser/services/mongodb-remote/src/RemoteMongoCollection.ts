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

import { Codec, Stream } from "mongodb-stitch-core-sdk";
import {
  ChangeEvent,
  RemoteCountOptions,
  RemoteDeleteResult,
  RemoteFindOptions,
  RemoteInsertManyResult,
  RemoteInsertOneResult,
  RemoteUpdateOptions,
  RemoteUpdateResult
} from "mongodb-stitch-core-services-mongodb-remote";
import RemoteMongoReadOperation from "./RemoteMongoReadOperation";

/**
 * The RemoteMongoCollection is the interface to a MongoDB database's
 * collection via Stitch, allowing read and write.
 *
 * It is retrieved from a [[RemoteMongoDatabase]].
 *
 * The read operations are [[find]], [[count]] and [[aggregate]].
 *
 * The write operations are [[insertOne]], [[insertMany]], 
 * [[updateOne]], [[updateMany]], [[deleteOne]], and [[deleteMany]].
 *
 * It is also possible to [[watch]] documents in the collection for
 * changes.
 *
 * If you are already familiar with MongoDB drivers, it is important
 * to understand that the RemoteMongoCollection only provides access
 * to the operations available in Stitch. For a list of unsupported
 * aggregation stages, see 
 * [Unsupported Aggregation Stages](https://docs.mongodb.com/stitch/mongodb/actions/collection.aggregate/#unsupported-aggregation-stages).
 *
 * @note Log in first
 *
 * A user will need to be logged in (at least anonymously) before you can read from
 * or write to the collection. See [[StitchAuth]].
 * 
 * @see
 * - [[RemoteMongoClient]]
 * - [[RemoteMongoDatabase]]
 * - [CRUD Snippets](https://docs.mongodb.com/stitch/mongodb/crud-snippets/)
 */
export default interface RemoteMongoCollection<DocumentT> {
  /**
   * Gets the namespace of this collection.
   *
   * @return the namespace
   */
  readonly namespace: string;

  /**
   * Create a new RemoteMongoCollection instance with a different default class to cast any
   * documents returned from the database into.
   *
   * @param codec the default class to cast any documents returned from the database into.
   * @param <NewDocumentT> the type that the new collection will encode documents from and decode
   *                      documents to.
   * @return a new CoreRemoteMongoCollection instance with the different default class
   */
  withCollectionType<U>(codec: Codec<U>): RemoteMongoCollection<U>;

  /**
   * Counts the number of documents in the collection.
   * @param query the query filter
   * @param options the options describing the count
   *
   * @return a Promise containing the number of documents in the collection
   */
  count(query?: object, options?: RemoteCountOptions): Promise<number>;

  /**
   * Finds all documents in the collection that match the given query.
   * 
   * An empty query (`{}`) will match all documents.
   *
   * @param query the query filter
   * @return a read operation which can be used to execute the query
   */
  find(
    query?: object,
    options?: RemoteFindOptions
  ): RemoteMongoReadOperation<DocumentT>;

  /**
   * Finds one document in the collection that matches the given query.
   * 
   * An empty query (`{}`) will match all documents.
   *
   * @param query the query filter
   * @return the resulting document or null if the query resulted in zero matches
   */
  findOne(
    query?: object,
    options?: RemoteFindOptions
  ): Promise<DocumentT | null>;

  /**
   * Aggregates documents according to the specified aggregation pipeline.
   *
   * Stitch supports a subset of the available aggregation stages in MongoDB.
   * See 
   * [Unsupported Aggregation Stages](https://docs.mongodb.com/stitch/mongodb/actions/collection.aggregate/#unsupported-aggregation-stages).
   *
   * @param pipeline the aggregation pipeline
   * @return a read operation which can be used to execute the aggregation
   */
  aggregate(pipeline: object[]): RemoteMongoReadOperation<DocumentT>;

  /**
   * Inserts the provided document. If the document is missing an identifier, the client should
   * generate one.
   *
   * @param document the document to insert
   * @return a Promise containing the result of the insert one operation
   */
  insertOne(document: DocumentT): Promise<RemoteInsertOneResult>;

  /**
   * Inserts one or more documents.
   *
   * @param documents the documents to insert
   * @return a Promise containing the result of the insert many operation
   */
  insertMany(documents: DocumentT[]): Promise<RemoteInsertManyResult>;

  /**
   * Removes at most one document from the collection that matches the given filter.
   * If no documents match, the collection is not modified.
   *
   * @param query the query filter to apply the the delete operation
   * @return a Promise containing the result of the remove one operation
   */
  deleteOne(query: object): Promise<RemoteDeleteResult>;

  /**
   * Removes all documents from the collection that match the given query filter.  If no documents
   * match, the collection is not modified.
   *
   * @param query the query filter to apply the the delete operation
   * @return a Promise containing the result of the remove many operation
   */
  deleteMany(query: object): Promise<RemoteDeleteResult>;

  /**
   * Update a single document in the collection according to the specified arguments.
   *
   * @param query         a document describing the query filter, which may not be null.
   * @param update        a document describing the update, which may not be null. The update to
   *                      apply must include only update operators.
   * @param updateOptions the options to apply to the update operation
   * @return a Promise containing the result of the update one operation
   */
  updateOne(
    query: object,
    update: object,
    updateOptions?: RemoteUpdateOptions
  ): Promise<RemoteUpdateResult>;

  /**
   * Update all documents in the collection according to the specified arguments.
   *
   * @param query         a document describing the query filter, which may not be null.
   * @param update        a document describing the update, which may not be null. The update to
   *                     apply must include only update operators.
   * @param updateOptions the options to apply to the update operation
   * @return a Promise containing the result of the update many operation
   */
  updateMany(
    query: object,
    update: object,
    updateOptions?: RemoteUpdateOptions
  ): Promise<RemoteUpdateResult>;

  /**
   * Opens a MongoDB change stream against the collection to watch for changes 
   * made to specific documents. The documents to watch must be explicitly 
   * specified by their _id.
   * 
   * This method requires a browser that supports EventSource (server-sent 
   * events). If you'd like this method to work in a browser that does not 
   * support EventSource, you must provide a polyfill that makes 
   * window.EventSource available. See
   * [EventSource Browser Compatibility on MDN](https://developer.mozilla.org/en-US/docs/Web/API/EventSource#Browser_compatibility)
   * for information on which browsers support EventSource.
   *
   * @note
   * This method does not support opening change streams on an entire collection
   * or a specific query.
   *
   * @param ids the _ids of the documents to watch in this change stream
   * @return a Promise containing a stream of change events representing the 
   *         changes to the watched documents.
   */
  watch(ids: Array<any>): Promise<Stream<ChangeEvent<DocumentT>>>;
}
