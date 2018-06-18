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

import { getDatabase } from "./TestUtils";

describe("CoreRemoteMongoDatabase", () => {
  it("should get name", () => {
    const db1 = getDatabase();
    expect(db1.name).toEqual("dbName1");

    const db2 = getDatabase("dbName2");
    expect(db2.name).toEqual("dbName2");
  });

  it("should get collection", () => {
    const db1 = getDatabase();
    const coll1 = db1.collection("collName1");
    expect(coll1.namespace).toEqual("dbName1.collName1");

    const coll2 = db1.collection("collName2");
    expect(coll2.namespace).toEqual("dbName1.collName2");
  });
});
