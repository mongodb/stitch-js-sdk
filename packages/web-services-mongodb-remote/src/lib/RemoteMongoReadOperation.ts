import { Decoder } from "stitch-core";
import { CoreRemoteMongoReadOperation } from "stitch-core-services-mongodb-remote";

/**
 * Represents a `find` or `aggregate` operation against a MongoDB collection. Use the methods in this class to execute
 * the operation and retrieve the results.
 */
export default class RemoteMongoReadOperation<T> {
  constructor(
    private readonly proxy: CoreRemoteMongoReadOperation<T>,
    private readonly decoder?: Decoder<T>
  ) {}

  public first(): Promise<T | undefined> {
    return this.proxy.first();
  }

  public asArray(): Promise<T[]> {
    return this.proxy.asArray();
  }

  public iterator(): Promise<Iterator<T>> {
    return this.proxy.iterator();
  }
}
