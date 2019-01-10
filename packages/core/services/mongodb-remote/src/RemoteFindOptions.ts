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
 * Options to use when executing a `find` command on a 
 * [[RemoteMongoCollection]].
 *
 * ### Example
 *
 * The following example assumes a user is already logged in (see [[StitchAuth]]
 * for more information on logging in).
 * ```
 * // Assumption: Stitch is already logged in
 * 
 * // Work with the movies collection
 * const moviesCollection = db.collection('movieDetails')
 * 
 * const options = {  // Match the shape of RemoteFindOptions.
 *   limit: 10,       // Return only first ten results.
 *   projection: {    // Return only the `title`, `releaseDate`, and
 *     title: 1,      // (implicitly) the `_id` fields.
 *     releaseDate: 1,
 *   },
 *   sort: {          // Sort by releaseDate descending (latest first).
 *     releaseDate: -1, 
 *   },
 * }
 * 
 * moviesCollection
 *   .find({}, options) // Match any document with {} query. Pass the options as the second argument.
 *   .toArray()
 *   .then(movies => console.log('Ten latest movies:', movies))
 *   .catch(console.error)
 * ```
 *
 * ### See also
 * - [[RemoteMongoCollection]]
 * - [[RemoteMongoCollection.find]]
 * - [[RemoteMongoReadOperation]]
 * - [CRUD Snippets](https://docs.mongodb.com/stitch/mongodb/crud-snippets/#find)
 */ 
export default interface RemoteFindOptions {
  /**
   * The maximum number of documents to return.
   */ 
  readonly limit?: number;

  /**
   * Limits the fields to return for all matching documents. See 
   * [Tutorial: Project Fields to Return from Query](https://docs.mongodb.com/manual/tutorial/project-fields-from-query-results/).
   */
  readonly projection?: object;

  /**
   * The order in which to return matching documents.
   */
  readonly sort?: object;
}
