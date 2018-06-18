import { CoreStitchServiceClient } from "mongodb-stitch-core-sdk";
import CoreRemoteMongoClient from "./CoreRemoteMongoClient";
import CoreRemoteMongoDatabase from "./CoreRemoteMongoDatabase";
import CoreRemoteMongoDatabaseImpl from "./CoreRemoteMongoDatabaseImpl";

export default class CoreRemoteMongoClientImpl
  implements CoreRemoteMongoClient {
  public constructor(readonly service: CoreStitchServiceClient) {}

  /**
   * Gets a `CoreRemoteMongoDatabase` instance for the given database name.
   *
   * - parameter name: the name of the database to retrieve
   */
  public db(name: string): CoreRemoteMongoDatabase {
    return new CoreRemoteMongoDatabaseImpl(name, this.service);
  }
}
