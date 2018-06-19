/// Options to use when executing a `count` command on a `RemoteMongoCollection`.
export default interface RemoteCountOptions {
  /// The maximum number of documents to count.
  readonly limit?: number;
}
