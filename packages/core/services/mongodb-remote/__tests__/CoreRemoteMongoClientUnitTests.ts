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

import { getClient } from "./TestUtils";

describe("CoreRemoteMongoClient", () => {
  it("should get database", () => {
    const client = getClient();
    const db1 = client.db("dbName1");
    expect("dbName1").toEqual(db1.name);

    const db2 = client.db("dbName2");
    expect("dbName2").toEqual(db2.name);
  });
});
