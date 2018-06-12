/// Options to use when executing an `updateOne` or `updateMany` command on a `RemoteMongoCollection`.
export default interface RemoteUpdateOptions {
  /// When true, creates a new document if no document matches the query.
  readonly upsert?: boolean;
}
