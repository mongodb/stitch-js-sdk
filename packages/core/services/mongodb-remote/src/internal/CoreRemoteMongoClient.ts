import { CoreStitchServiceClient } from "mongodb-stitch-core-sdk";
import { CoreRemoteMongoDatabase } from "..";

export default interface CoreRemoteMongoClient {
  readonly service: CoreStitchServiceClient;

  db(name: string): CoreRemoteMongoDatabase;
}
