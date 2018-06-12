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
