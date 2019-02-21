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
import ChangeEvent from "../ChangeEvent";
import RemoteCountOptions from "../RemoteCountOptions";
import RemoteDeleteResult from "../RemoteDeleteResult";
import RemoteFindOptions from "../RemoteFindOptions";
import RemoteInsertManyResult from "../RemoteInsertManyResult";
import RemoteInsertOneResult from "../RemoteInsertOneResult";
import RemoteUpdateOptions from "../RemoteUpdateOptions";
import RemoteUpdateResult from "../RemoteUpdateResult";
import CoreRemoteMongoReadOperation from "./CoreRemoteMongoReadOperation";

/** @hidden */
export default interface CoreRemoteMongoCollection<DocumentT> {
  /**
   * Gets the namespace of this collection.
   *
   * @return the namespace
   */
  readonly namespace: string;

  /**
   * Create a new CoreRemoteMongoCollection instance with a different default class to cast any
   * documents returned from the database into.
   *
   * @param codec the default class to cast any documents returned from the database into.
   * @param <NewDocumentT> the type that the new collection will encode documents from and decode
   *                      documents to.
   * @return a new CoreRemoteMongoCollection instance with the different default class
   */
  withCollectionType<U>(codec: Codec<U>): CoreRemoteMongoCollection<U>;

  /**
   * Counts the number of documents in the collection.
   * @param query the query filter
   * @param options the options describing the count
   *
   * @return the number of documents in the collection
   */
  count(query?: object, options?: RemoteCountOptions): Promise<number>;

  /**
   * Finds all documents in the collection.
   *
   * @param query the query filter
   * @return the find iterable interface
   */
  find(
    query?: object,
    options?: RemoteFindOptions
  ): CoreRemoteMongoReadOperation<DocumentT>;

  /**
   * Finds one documents in the collection.
   *
   * @param query the query filter
   * @return the resulting document or null if no such document exists
   */
  findOne(
    query?: object,
    options?: RemoteFindOptions
  ): Promise<DocumentT | null>;

  /**
   * Aggregates documents according to the specified aggregation pipeline.
   *
   * @param pipeline the aggregation pipeline
   * @return an iterable containing the result of the aggregation operation
   */
  aggregate(pipeline: object[]): CoreRemoteMongoReadOperation<DocumentT>;

  /**
   * Inserts the provided document. If the document is missing an identifier, the client should
   * generate one.
   *
   * @param document the document to insert
   * @return the result of the insert one operation
   */
  insertOne(document: DocumentT): Promise<RemoteInsertOneResult>;

  /**
   * Inserts one or more documents.
   *
   * @param documents the documents to insert
   * @return the result of the insert many operation
   */
  insertMany(documents: DocumentT[]): Promise<RemoteInsertManyResult>;

  /**
   * Removes at most one document from the collection that matches the given filter.  If no
   * documents match, the collection is not
   * modified.
   *
   * @param query the query filter to apply the the delete operation
   * @return the result of the remove one operation
   */
  deleteOne(query: object): Promise<RemoteDeleteResult>;

  /**
   * Removes all documents from the collection that match the given query filter.  If no documents
   * match, the collection is not modified.
   *
   * @param query the query filter to apply the the delete operation
   * @return the result of the remove many operation
   */
  deleteMany(query: object): Promise<RemoteDeleteResult>;

  /**
   * Update a single document in the collection according to the specified arguments.
   *
   * @param query         a document describing the query filter, which may not be null.
   * @param update        a document describing the update, which may not be null. The update to
   *                      apply must include only update operators.
   * @param updateOptions the options to apply to the update operation
   * @return the result of the update one operation
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
   * @return the result of the update many operation
   */
  updateMany(
    query: object,
    update: object,
    updateOptions?: RemoteUpdateOptions
  ): Promise<RemoteUpdateResult>;

  watch(
    ids: any[]
  ): Promise<Stream<ChangeEvent<DocumentT>>>;
}
