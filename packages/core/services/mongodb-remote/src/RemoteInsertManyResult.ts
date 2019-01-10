/**
 * Copyright 2018-present MongoDB, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * The result of an `insertMany` command on a [[RemoteMongoCollection]].
 * 
 * ### See also
 * - [[RemoteMongoCollection]]
 * - [[RemoteMongoCollection.insertOne]]
 */
export default class RemoteInsertManyResult {
  /**
   * Map of the index of the inserted document to the new id of the inserted document.
   *
   * If the document doesn't have an identifier, this value will be generated
   * by the Stitch server and added to the document before insertion.
   */
  public readonly insertedIds: {[key: number]: string};

  /** @hidden
   * Given an ordered array of insertedIds, creates a corresponding 
   * {@link RemoteInsertManyResult}.
   */
  constructor(arr: any[]) {
    const inserted = {};
    arr.forEach((value, index) => {
      inserted[index] = value;
    });
    this.insertedIds = inserted;
  }
}
