import { CoreRemoteMongoClient } from "mongodb-stitch-core-services-mongodb-remote";
import { RemoteMongoClient } from "../RemoteMongoClient";
import RemoteMongoDatabase from "../RemoteMongoDatabase";
import RemoteMongoDatabaseImpl from "./RemoteMongoDatabaseImpl";

export default class RemoteMongoClientImpl implements RemoteMongoClient {
  constructor(private readonly proxy: CoreRemoteMongoClient) {}

  /**
   * Gets a {@link RemoteMongoDatabase} instance for the given database name.
   *
   * @param name the name of the database to retrieve
   * @return a {@code RemoteMongoDatabase} representing the specified database
   */
  public db(name: string): RemoteMongoDatabase {
    return new RemoteMongoDatabaseImpl(this.proxy.db(name));
  }
}
