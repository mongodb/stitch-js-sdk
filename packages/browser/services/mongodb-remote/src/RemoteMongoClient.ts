import {
  NamedServiceClientFactory,
  StitchServiceClient
} from "mongodb-stitch-browser-core";
import { StitchAppClientInfo } from "mongodb-stitch-core-sdk";
import { CoreRemoteMongoClientImpl } from "mongodb-stitch-core-services-mongodb-remote";
import RemoteMongoClientImpl from "./internal/RemoteMongoClientImpl";
import RemoteMongoDatabase from "./RemoteMongoDatabase";

/**
 * The remote MongoClient used for working with data in MongoDB remotely via Stitch.
 */
export interface RemoteMongoClient {
  /**
   * Gets a {@link RemoteMongoDatabase} instance for the given database name.
   *
   * @param name the name of the database to retrieve
   * @return a {@code RemoteMongoDatabase} representing the specified database
   */
  db(name: string): RemoteMongoDatabase;
}

export namespace RemoteMongoClient {
  export const factory: NamedServiceClientFactory<RemoteMongoClient> = new class
    implements NamedServiceClientFactory<RemoteMongoClient> {
    public getNamedClient(
      service: StitchServiceClient,
      client: StitchAppClientInfo
    ): RemoteMongoClient {
      return new RemoteMongoClientImpl(new CoreRemoteMongoClientImpl(service));
    }
  }();
}
