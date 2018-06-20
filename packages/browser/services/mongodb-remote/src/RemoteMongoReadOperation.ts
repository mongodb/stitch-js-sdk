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

import { Decoder } from "mongodb-stitch-core-sdk";
import { CoreRemoteMongoReadOperation } from "mongodb-stitch-core-services-mongodb-remote";

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
