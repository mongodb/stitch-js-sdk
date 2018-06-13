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
