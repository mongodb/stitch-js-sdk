import { CoreStitchServiceClient } from "stitch-core";
import { CoreRemoteMongoDatabase } from "..";

export default interface CoreRemoteMongoClient {
  readonly service: CoreStitchServiceClient;

  db(name: string): CoreRemoteMongoDatabase;
}
