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
 * Options to use when executing a `findOneAndUpdate` command on a 
 * [[RemoteMongoCollection]].
 *
 * @see
 * - [[RemoteMongoCollection]]
 * - [[RemoteMongoCollection.findOneAndDelete]]
 * - [CRUD Snippets](https://docs.mongodb.com/stitch/mongodb/crud-snippets/#findOneAndUpdate)
 */ 
export default interface RemoteFindOneAndDeleteOptions {  
    /**
     * Optional: Limits the fields to return for all matching documents. See 
     */
    readonly projection?: object;
  
    /**
     * Optional: Specifies the query sort order. Sort documents specify one or more fields to 
     * sort on  where the value of each field indicates whether MongoDB should sort it in 
     * ascending (1) or descending (0) order. 
     * The sort order determines which document collection.findOneAndDelete() affects.
     */
    readonly sort?: object;
  }
