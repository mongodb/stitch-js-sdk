/// The result of an `updateOne` or `updateMany` operation a `RemoteMongoCollection`.
export default interface RemoteUpdateResult {
  /// The number of documents that matched the filter.
  readonly matchedCount: number;

  /// The identifier of the inserted document if an upsert took place.
  readonly upsertedId: any;
}
