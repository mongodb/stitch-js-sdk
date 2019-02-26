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
  CoreRemoteMongoCollection,
  RemoteCountOptions,
  RemoteDeleteResult,
  RemoteFindOneAndDeleteOptions,
  RemoteFindOneAndUpdateOptions, 
  RemoteFindOptions,
  RemoteInsertManyResult,
  RemoteInsertOneResult,
  RemoteUpdateOptions,
  RemoteUpdateResult
} from "mongodb-stitch-core-services-mongodb-remote";
import RemoteMongoCollection from "../RemoteMongoCollection";
import RemoteMongoReadOperation from "../RemoteMongoReadOperation";

/** @hidden */
export default class RemoteMongoCollectionImpl<DocumentT> {
  /**
   * Gets the namespace of this collection.
   *
   * @return the namespace
   */
  public readonly namespace: string = this.proxy.namespace;

  public constructor(
    private readonly proxy: CoreRemoteMongoCollection<DocumentT>,
  ) {}
  /**
   * Create a new CoreRemoteMongoCollection instance with a different default class to cast any
   * documents returned from the database into.
   *
   * @param codec the default class to decode any documents returned from the database into.
   * @param <NewDocumentT> the type that the new collection will encode documents from and decode
   *                      documents to.
   * @return a new CoreRemoteMongoCollection instance with the different default class
   */
  public withCollectionType<U>(codec: Codec<U>): RemoteMongoCollection<U> {
    return new RemoteMongoCollectionImpl(
      this.proxy.withCollectionType(codec)
    );
  }

  /**
   * Counts the number of documents in the collection.
   * @param query the query filter
   * @param options the options describing the count
   *
   * @return the number of documents in the collection
   */
  public count(query?: object, options?: RemoteCountOptions): Promise<number> {
    return this.proxy.count(query, options);
  }

  /**
   * Finds all documents in the collection.
   *
   * @param query the query filter
   * @return the find iterable interface
   */
  public find(
    query?: object,
    options?: RemoteFindOptions
  ): RemoteMongoReadOperation<DocumentT> {
    return new RemoteMongoReadOperation(
      this.proxy.find(query, options)
    );
  }
   
  /**
   * Finds one document in the collection.
   *
   * @param query the query filter
   * @return the resulting document or null if the query resulted in zero matches
   */
  public findOne(
    query?: object,
    options?: RemoteFindOptions
  ): Promise<DocumentT | null> {
    return this.proxy.findOne(query, options);
  }

  /**
   * Finds one document in the collection that matches the given query and performs the 
   * given update on that document. (An empty query {} will match all documents)
   *
   * @param query A `Document` that should match the query.
   * @param update A `Document` describing the update. 
   * @param options Optional: `RemoteFindOneAndUpdateOptions` to use when executing the command.
   * @return A resulting `DocumentT` or null if the query returned zero matches.
   */
  public findOneAndUpdate(
    query: object,
    update: object, 
    options?: RemoteFindOneAndUpdateOptions
  ): Promise<DocumentT | null> {
    return this.proxy.findOneAndUpdate(query, update, options);
  }

  /**
   * Finds one document in the collection that matches the given query and replaces that document 
   * with the given replacement. (An empty query {} will match all documents)
   *
   * @param query A `Document` that should match the query.
   * @param replacement A `Document` that will replace the matched document 
   * @param options Optional: `RemoteFindOneAndUpdateOptions` to use when executing the command.
   * @return A resulting `DocumentT` or null if the query returned zero matches.
   */
  public findOneAndReplace(
    query: object,
    replacement: object, 
    options?: RemoteFindOneAndUpdateOptions
  ): Promise<DocumentT | null> {
    return this.proxy.findOneAndReplace(query, replacement, options)
  }

  /**
   * Finds one document in the collection that matches the given query and 
   * deletes that document. (An empty query {} will match all documents)
   *
   * @param query A `Document` that should match the query.
   * @param options Optional: `RemoteFindOneAndDeleteOptions` to use when executing the command.
   * @return The `DocumentT` being deleted or null if the query returned zero matches.
   */
  public findOneAndDelete(
    query: object,
    options?: RemoteFindOneAndDeleteOptions
  ): Promise<DocumentT | null> {
    return this.proxy.findOneAndDelete(query, options);
  }

  /**
   * Aggregates documents according to the specified aggregation pipeline.
   *
   * @param pipeline the aggregation pipeline
   * @return an iterable containing the result of the aggregation operation
   */
  public aggregate(pipeline: object[]): RemoteMongoReadOperation<DocumentT> {
    return new RemoteMongoReadOperation(
      this.proxy.aggregate(pipeline)
    );
  }

  /**
   * Inserts the provided document. If the document is missing an identifier, the client should
   * generate one.
   *
   * @param doc the document to insert
   * @return the result of the insert one operation
   */
  public insertOne(doc: DocumentT): Promise<RemoteInsertOneResult> {
    return this.proxy.insertOne(doc);
  }

  /**
   * Inserts one or more documents.
   *
   * @param docs the documents to insert
   * @return the result of the insert many operation
   */
  public insertMany(docs: DocumentT[]): Promise<RemoteInsertManyResult> {
    return this.proxy.insertMany(docs);
  }

  /**
   * Removes at most one document from the collection that matches the given filter.  If no
   * documents match, the collection is not
   * modified.
   *
   * @param query the query filter to apply the the delete operation
   * @return the result of the remove one operation
   */
  public deleteOne(query: object): Promise<RemoteDeleteResult> {
    return this.proxy.deleteOne(query);
  }

  /**
   * Removes all documents from the collection that match the given query filter.  If no documents
   * match, the collection is not modified.
   *
   * @param query the query filter to apply the the delete operation
   * @return the result of the remove many operation
   */
  public deleteMany(query: object): Promise<RemoteDeleteResult> {
    return this.proxy.deleteMany(query);
  }

  /**
   * Update a single document in the collection according to the specified arguments.
   *
   * @param query         a document describing the query filter, which may not be null.
   * @param update        a document describing the update, which may not be null. The update to
   *                      apply must include only update operators.
   * @param updateOptions the options to apply to the update operation
   * @return the result of the update one operation
   */
  public updateOne(
    query: object,
    update: object,
    updateOptions?: RemoteUpdateOptions
  ): Promise<RemoteUpdateResult> {
    return this.proxy.updateOne(query, update, updateOptions);
  }

  /**
   * Update all documents in the collection according to the specified arguments.
   *
   * @param query         a document describing the query filter, which may not be null.
   * @param update        a document describing the update, which may not be null. The update to
   *                     apply must include only update operators.
   * @param updateOptions the options to apply to the update operation
   * @return the result of the update many operation
   */
  public updateMany(
    query: object,
    update: object,
    updateOptions?: RemoteUpdateOptions
  ): Promise<RemoteUpdateResult> {
    return this.proxy.updateMany(query, update, updateOptions);
  }

  /**
   * Opens a MongoDB change stream against the collection to watch for changes 
   * made to specific documents. Please note that this method does not support 
   * opening change streams on an entire collection or a specific query. The 
   * documents to watch must be explicitly specified by their _id.
   * 
   * @param ids the _ids of the documents to watch in this change stream
   * @return a Promise containing a stream of change events representing the 
   *         changes to the watched documents.
   */
  public watch(ids: any[]): Promise<Stream<ChangeEvent<DocumentT>>> {
    return this.proxy.watch(ids);
  }
}
