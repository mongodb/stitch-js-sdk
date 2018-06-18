import { Codec } from "mongodb-stitch-core-sdk";
import { CoreRemoteMongoDatabase } from "mongodb-stitch-core-services-mongodb-remote";
import RemoteMongoCollection from "../RemoteMongoCollection";
import RemoteMongoCollectionImpl from "./RemoteMongoCollectionImpl";

/**
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
