/// The result of a `delete` command on a `RemoteMongoCollection`.
export default interface RemoteDeleteResult {
  /// The number of documents that were deleted.
  readonly deletedCount: number;
}
