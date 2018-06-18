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

import { ObjectID } from "bson";
import { Codec, CoreStitchServiceClient } from "mongodb-stitch-core-sdk";
import RemoteCountOptions from "../RemoteCountOptions";
import RemoteDeleteResult from "../RemoteDeleteResult";
import RemoteFindOptions from "../RemoteFindOptions";
import RemoteInsertManyResult from "../RemoteInsertManyResult";
import RemoteInsertOneResult from "../RemoteInsertOneResult";
import RemoteUpdateOptions from "../RemoteUpdateOptions";
import RemoteUpdateResult from "../RemoteUpdateResult";
import CoreRemoteMongoCollection from "./CoreRemoteMongoCollection";
import CoreRemoteMongoReadOperation from "./CoreRemoteMongoReadOperation";
import ResultDecoders from "./ResultDecoders";

export default class CoreRemoteMongoCollectionImpl<T>
  implements CoreRemoteMongoCollection<T> {
  public readonly namespace = this.databaseName + "." + this.name;

  private readonly baseOperationArgs: object = (() => {
    return {
      collection: this.name,
      database: this.databaseName
    };
  })();

  public constructor(
    public readonly name: string,
    public readonly databaseName: string,
    private readonly service: CoreStitchServiceClient,
    private readonly codec?: Codec<T>
  ) {}

  /**
   * Creates a collection using the same datatabase name and collection name, but with a new `Codable` type with
   * which to encode and decode documents retrieved from and inserted into the collection.
   */
  public withCollectionType<U>(codec: Codec<U>): CoreRemoteMongoCollection<U> {
    return new CoreRemoteMongoCollectionImpl<U>(
      this.name,
      this.databaseName,
      this.service,
      codec
    );
  }

  /**
   * Finds the documents in this collection which match the provided filter.
   *
   * - parameters:
   *   - filter: A `Document` that should match the query.
   *   - options: Optional `RemoteFindOptions` to use when executing the command.
   *
   * - important: Invoking this method by itself does not perform any network requests. You must call one of the
   *              methods on the resulting `CoreRemoteMongoReadOperation` instance to trigger the operation against
   *              the database.
   *
   * - returns: A `CoreRemoteMongoReadOperation` that allows retrieval of the resulting documents.
   */
  public find(
    filter: object = {},
    options?: RemoteFindOptions
  ): CoreRemoteMongoReadOperation<T> {
    const args = Object.assign({}, this.baseOperationArgs);

    args["query"] = filter;

    if (options) {
      if (options.limit) {
        args["limit"] = options.limit;
      }
      if (options.projection) {
        args["project"] = options.projection;
      }
      if (options.sort) {
        args["sort"] = options.sort;
      }
    }

    return new CoreRemoteMongoReadOperation<T>(
      "find",
      args,
      this.service,
      this.codec
    );
  }

  /**
   * Runs an aggregation framework pipeline against this collection.
   *
   * - Parameters:
   *   - pipeline: An `[Document]` containing the pipeline of aggregation operations to perform.
   *
   * - important: Invoking this method by itself does not perform any network requests. You must call one of the
   *              methods on the resulting `CoreRemoteMongoReadOperation` instance to trigger the operation against the
   *              database.
   *
   * - returns: A `CoreRemoteMongoReadOperation` that allows retrieval of the resulting documents.
   */
  public aggregate(pipeline: object[]): CoreRemoteMongoReadOperation<T> {
    const args = Object.assign({}, this.baseOperationArgs);

    args["pipeline"] = pipeline;

    return new CoreRemoteMongoReadOperation<T>(
      "aggregate",
      args,
      this.service,
      this.codec
    );
  }

  /**
   * Counts the number of documents in this collection matching the provided filter.
   *
   * - Parameters:
   *   - filter: a `Document`, the filter that documents must match in order to be counted.
   *   - options: Optional `RemoteCountOptions` to use when executing the command.
   *
   * - Returns: The count of the documents that matched the filter.
   */
  public count(
    query: object = {},
    options?: RemoteCountOptions
  ): Promise<number> {
    const args = Object.assign({}, this.baseOperationArgs);
    args["query"] = query;

    if (options && options.limit) {
      args["limit"] = options.limit;
    }

    return this.service.callFunctionInternal("count", [args]);
  }

  /**
   * Encodes the provided value to BSON and inserts it. If the value is missing an identifier, one will be
   * generated for it.
   *
   * - Parameters:
   *   - value: A `CollectionType` value to encode and insert.
   *
   * - Returns: The result of attempting to perform the insert.
   */
  public insertOne(value: T): Promise<RemoteInsertOneResult> {
    const args = Object.assign({}, this.baseOperationArgs);

    args["document"] = this.generateObjectIdIfMissing(
      this.codec ? this.codec.encode(value) : (value as any)
    );

    return this.service.callFunctionInternal(
      "insertOne",
      [args],
      ResultDecoders.remoteInsertOneResultDecoder
    );
  }

  /**
   * Encodes the provided values to BSON and inserts them. If any values are missing identifiers,
   * they will be generated.
   *
   * - Parameters:
   *   - documents: The `T` values to insert.
   *
   * - Returns: The result of attempting to perform the insert.
   */
  public insertMany(docs: T[]): Promise<RemoteInsertManyResult> {
    const args = Object.assign({}, this.baseOperationArgs);

    args["documents"] = docs.map(doc =>
      this.generateObjectIdIfMissing(
        this.codec ? this.codec.encode(doc) : (doc as any)
      )
    );

    return this.service.callFunctionInternal(
      "insertMany",
      [args],
      ResultDecoders.remoteInsertManyResultDecoder
    );
  }

  /**
   * Deletes a single matching document from the collection.
   *
   * - Parameters:
   *   - filter: A `Document` representing the match criteria.
   *
   * - Returns: The result of performing the deletion.
   */
  public deleteOne(query: object): Promise<RemoteDeleteResult> {
    return this.executeDelete(query, false);
  }

  /**
   * Deletes multiple documents
   *
   * - Parameters:
   *   - filter: Document representing the match criteria
   *
   * - Returns: The result of performing the deletion.
   */
  public deleteMany(query: object): Promise<RemoteDeleteResult> {
    return this.executeDelete(query, true);
  }

  /**
   * Updates a single document matching the provided filter in this collection.
   *
   * - Parameters:
   *   - query: A `Document` representing the match criteria.
   *   - update: A `Document` representing the update to be applied to a matching document.
   *   - options: Optional `RemoteUpdateOptions` to use when executing the command.
   *
   * - Returns: The result of attempting to update a document.
   */
  public updateOne(
    query: object,
    update: object,
    options?: RemoteUpdateOptions
  ): Promise<RemoteUpdateResult> {
    return this.executeUpdate(query, update, options, false);
  }

  /**
   * Updates multiple documents matching the provided filter in this collection.
   *
   * - Parameters:
   *   - filter: A `Document` representing the match criteria.
   *   - update: A `Document` representing the update to be applied to matching documents.
   *   - options: Optional `RemoteUpdateOptions` to use when executing the command.
   *
   * - Returns: The result of attempting to update multiple documents.
   */
  public updateMany(
    query: object,
    update: object,
    options?: RemoteUpdateOptions
  ): Promise<RemoteUpdateResult> {
    return this.executeUpdate(query, update, options, true);
  }

  private executeDelete(
    query: object,
    multi: boolean
  ): Promise<RemoteDeleteResult> {
    const args = Object.assign({}, this.baseOperationArgs);
    args["query"] = query;

    return this.service.callFunctionInternal(
      multi ? "deleteMany" : "deleteOne",
      [args],
      ResultDecoders.remoteDeleteResultDecoder
    );
  }

  private executeUpdate(
    query: object,
    update: object,
    options?: RemoteUpdateOptions,
    multi: boolean = false
  ): Promise<RemoteUpdateResult> {
    const args = Object.assign({}, this.baseOperationArgs);

    args["query"] = query;
    args["update"] = update;

    if (options && options.upsert) {
      args["upsert"] = options.upsert;
    }

    return this.service.callFunctionInternal(
      multi ? "updateMany" : "updateOne",
      [args],
      ResultDecoders.remoteUpdateResultDecoder
    );
  }

  /// Returns a version of the provided document with an ObjectId
  private generateObjectIdIfMissing(doc: object): object {
    if (!doc["_id"]) {
      const newDoc = doc;
      newDoc["_id"] = new ObjectID();
      return newDoc;
    }
    return doc;
  }
}
