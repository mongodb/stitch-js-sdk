/// Options to use when executing a `find` command on a `RemoteMongoCollection`.
export default interface RemoteFindOptions {
  /// The maximum number of documents to return.
  readonly limit?: number;

  /// Limits the fields to return for all matching documents.
  readonly projection?: object;

  /// The order in which to return matching documents.
  readonly sort?: object;
}
