import { Codec } from "mongodb-stitch-core-sdk";
import CoreRemoteMongoCollection from "./CoreRemoteMongoCollection";

export default interface CoreRemoteMongoDatabase {
  /**
   * Gets the name of the database.
   *
   * @return the database name
   */
  readonly name: string;

  /**
   * Gets a collection.
   *
   * @param name the name of the collection to return
   * @return the collection
   */
  collection<T>(name: string, codec?: Codec<T>): CoreRemoteMongoCollection<T>;
}
