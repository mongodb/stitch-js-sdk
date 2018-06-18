import { Codec } from "mongodb-stitch-core-sdk";
import {
  CoreRemoteMongoCollection,
  RemoteCountOptions,
  RemoteDeleteResult,
  RemoteFindOptions,
  RemoteInsertManyResult,
  RemoteInsertOneResult,
  RemoteUpdateOptions,
  RemoteUpdateResult
} from "mongodb-stitch-core-services-mongodb-remote";
import RemoteMongoCollection from "../RemoteMongoCollection";
import RemoteMongoReadOperation from "../RemoteMongoReadOperation";

export default class RemoteMongoCollectionImpl<DocumentT> {
  /**
   * Gets the namespace of this collection.
   *
   * @return the namespace
   */
  public readonly namespace: string = this.proxy.namespace;

  constructor(
    private readonly proxy: CoreRemoteMongoCollection<DocumentT>,
    private readonly codec?: Codec<DocumentT>
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
      this.proxy.withCollectionType(codec),
      codec
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
      this.proxy.find(query, options),
      this.codec
    );
  }

  /**
   * Aggregates documents according to the specified aggregation pipeline.
   *
   * @param pipeline the aggregation pipeline
   * @return an iterable containing the result of the aggregation operation
   */
  public aggregate(pipeline: object[]): RemoteMongoReadOperation<DocumentT> {
    return new RemoteMongoReadOperation(
      this.proxy.aggregate(pipeline),
      this.codec
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
}
