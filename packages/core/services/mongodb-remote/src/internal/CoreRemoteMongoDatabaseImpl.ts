import { Codec, CoreStitchServiceClient } from "mongodb-stitch-core-sdk";
import CoreRemoteMongoCollection from "./CoreRemoteMongoCollection";
import CoreRemoteMongoCollectionImpl from "./CoreRemoteMongoCollectionImpl";
import CoreRemoteMongoDatabase from "./CoreRemoteMongoDatabase";

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
