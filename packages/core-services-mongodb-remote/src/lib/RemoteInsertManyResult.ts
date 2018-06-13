/// The result of an `insertMany` command on a `RemoteMongoCollection`.
export default class RemoteInsertManyResult {
  /// Map of the index of the inserted document to the id of the inserted document.
  public readonly insertedIds: Record<number, any>;

  /// Given an ordered array of insertedIds, creates a corresponding `RemoteInsertManyResult`.
  constructor(arr: any[]) {
    const inserted = {};
    arr.forEach((value, index) => {
      inserted[index] = value;
    });
    this.insertedIds = inserted;
  }
}
