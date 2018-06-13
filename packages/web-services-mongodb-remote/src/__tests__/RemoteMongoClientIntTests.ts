import { ObjectID, ObjectId } from "bson";
import {
  Anon,
  App,
  AppResponse,
  MongoDbRuleCreator,
  Service,
  ServiceResponse
} from "stitch-admin";
import {
  AnonymousCredential,
  Codec,
  StitchServiceErrorCode,
  StitchServiceException
} from "stitch-core";
import BaseStitchIntTestHarness from "stitch-web-testutils";
import { Mongo } from "../../../admin/dist/services/ServiceConfigs";
import {
  RemoteMongoClient,
  RemoteMongoService
} from "../lib/RemoteMongoClient";
import RemoteMongoCollection from "../lib/RemoteMongoCollection";

const mongodbUriProp = "TEST_STITCH_MONGODBURI";

let mongoClient: RemoteMongoClient;

let dbName: string;
let collName: string;

const mongodbUri: string = (() => {
  const prop = process.env[mongodbUriProp];
  return prop ? prop : "mongodb://localhost:26000";
})();

const harness = new BaseStitchIntTestHarness();

function getTestColl<ResultT>(
  codec?: Codec<ResultT>
): RemoteMongoCollection<ResultT> {
  const db = mongoClient.db(dbName);
  expect(dbName).toEqual(db.name);
  const coll = db.collection(collName, codec);
  expect(`${dbName}.${collName}`).toEqual(coll.namespace);
  return coll;
}

function withoutIds(docs: object[]): object[] {
  return docs.map(doc => withoutId(doc));
}

function withoutId(doc: object): object {
  const newDoc = Object.assign({}, doc);
  delete newDoc["_id"];
  return newDoc;
}

beforeAll(() => harness.setup());
afterAll(() => harness.teardown());

beforeEach(async () => {
  if (!mongodbUri) {
    fail(new Error("no MongoDB URI in properties; failing test"));
  }

  dbName = new ObjectID().toHexString();
  collName = new ObjectId().toHexString();

  const [appResponse, app] = await harness.createApp();
  await harness.addProvider(app as App, new Anon());
  const [_, svc] = await harness.addService(app as App, "mongodb", {
    config: { uri: mongodbUri },
    name: "mongodb1",
    type: "mongodb"
  });

  const rule = {
    other_fields: {},
    read: {},
    write: {}
  };

  await harness.addRule(
    svc as Service,
    new MongoDbRuleCreator(`${dbName}.${collName}`, rule)
  );

  const client = harness.getAppClient(appResponse as AppResponse);
  await client.auth.loginWithCredential(new AnonymousCredential());
  mongoClient = client.getServiceClientWithName(
    RemoteMongoService.Factory,
    "mongodb1"
  );
});

describe("RemoteMongoClient", () => {
  it("should count", async () => {
    const coll = getTestColl();
    expect(0).toEqual(await coll.count());

    const rawDoc = { hello: "world" };
    const doc1 = Object.assign({}, rawDoc);
    const doc2 = Object.assign({}, rawDoc);
    await coll.insertOne(doc1);
    expect(1).toEqual(await coll.count());
    await coll.insertOne(doc2);
    expect(2).toEqual(await coll.count());

    expect(2).toEqual(await coll.count(rawDoc));
    expect(0).toEqual(await coll.count({ hello: "Friend" }));
    expect(1).toEqual(await coll.count(rawDoc, { limit: 1 }));

    try {
      await coll.count({ $who: 1 });
      fail();
    } catch (error) {
      expect(error instanceof StitchServiceException);
      expect(StitchServiceErrorCode.MongoDBError).toEqual(error.errorCode);
    }
  });

  it("should find", async () => {
    const coll = getTestColl();
    let iter = await coll.find();
    expect((await iter.iterator()).next().value).toBeUndefined();
    expect(await iter.first()).toBeUndefined();

    const doc1 = { hello: "world" };
    const doc2 = { hello: "friend" };
    doc2["proj"] = "field";
    await coll.insertMany([doc1, doc2]);
    expect((await iter.iterator()).next().done).toBeFalsy();
    expect(withoutId(doc1)).toEqual(withoutId((await iter.first()) as any));
    expect(withoutId(doc2)).toEqual(
      withoutId(
        (await coll
          .find(undefined, { limit: 1, sort: { _id: -1 } })
          .iterator()).next().value
      )
    );

    iter = coll.find(doc1);
    expect((await iter.iterator()).next().done).toBeFalsy();
    expect(withoutId(doc1)).toEqual(
      withoutId((await iter.iterator()).next().value)
    );

    iter = await coll.find(doc1);
    expect((await iter.iterator()).next().done).toBeFalsy();
    expect(withoutId(doc1)).toEqual(
      withoutId((await iter.iterator()).next().value)
    );

    expect({ proj: "field" }).toEqual(
      withoutId(
        (await coll.find(doc2, { projection: { proj: 1 } }).iterator()).next()
          .value
      )
    );

    let count = 0;
    (await coll.find().asArray()).forEach(_ => {
      count++;
    });
    expect(2).toEqual(count);

    expect(
      (await coll.find().asArray()).find(it => {
        return doc1.hello === it["hello"];
      })
    ).toBeDefined();

    expect([doc1, doc2]).toEqual(await coll.find().asArray());

    const asyncIter = await iter.iterator();
    expect(doc1).toEqual(await asyncIter.next().value);

    try {
      await coll.find({ $who: 1 }).first();
      fail();
    } catch (error) {
      expect(error instanceof StitchServiceException).toBeTruthy();
      expect(StitchServiceErrorCode.MongoDBError).toEqual(error.errorCode);
    }
  });

  it("should aggregate", async () => {
    const coll = getTestColl();
    let iter = coll.aggregate([]);
    expect((await iter.iterator()).next().value).toBeUndefined();
    expect(await iter.first()).toBeUndefined();

    const doc1 = { hello: "world" };
    const doc2 = { hello: "friend" };
    await coll.insertMany([doc1, doc2]);
    expect(await iter.first()).toBeDefined();
    expect(withoutId(doc1)).toEqual(withoutId((await iter.first()) as any));

    iter = coll.aggregate([{ $sort: { _id: -1 } }, { $limit: 1 }]);
    expect(withoutId(doc2)).toEqual(
      withoutId((await iter.iterator()).next().value)
    );

    iter = coll.aggregate([{ $match: doc1 }]);
    expect((await iter.iterator()).next().value).toBeDefined();
    expect(withoutId(doc1)).toEqual(
      withoutId((await iter.iterator()).next().value)
    );

    try {
      await coll.aggregate([{ $who: 1 }]).first();
      fail();
    } catch (error) {
      expect(error instanceof StitchServiceException).toBeTruthy();
      expect(StitchServiceErrorCode.MongoDBError).toEqual(error.errorCode);
    }
  });

  it("should insert one", async () => {
    const coll = getTestColl();
    const doc = { hello: "world" };
    doc["_id"] = new ObjectId();

    expect(doc["_id"]).toEqual((await coll.insertOne(doc)).insertedId);
    try {
      await coll.insertOne(doc);
      fail();
    } catch (error) {
      expect(error instanceof StitchServiceException);
      expect(StitchServiceErrorCode.MongoDBError).toEqual(error.errorCode);
      expect((error.message as string).indexOf("duplicate")).toBeGreaterThan(0);
    }

    const doc2 = { hello: "world" };
    expect(doc["_id"]).not.toEqual((await coll.insertOne(doc2)).insertedId);
  });

  it("should insert many", async () => {
    const coll = getTestColl();
    const doc1 = { hello: "world" };
    doc1["_id"] = new ObjectID();

    expect(doc1["_id"]).toEqual((await coll.insertMany([doc1])).insertedIds[0]);
    try {
      await coll.insertMany([doc1]);
    } catch (error) {
      expect(error instanceof StitchServiceException);
      expect(StitchServiceErrorCode.MongoDBError).toEqual(error.errorCode);
      expect((error.message as string).indexOf("duplicate")).toBeGreaterThan(0);
    }

    const doc2 = { hello: "world" };
    expect(doc1["_id"]).not.toEqual(
      (await coll.insertMany([doc2])).insertedIds[0]
    );

    const doc3 = { one: "two" };
    const doc4 = { three: 4 };

    await coll.insertMany([doc3, doc4]);
    expect(withoutIds([doc1, doc2, doc3, doc4])).toEqual(
      withoutIds(await coll.find().asArray())
    );
  });

  it("should delete one", async () => {
    const coll = getTestColl();
    expect(0).toEqual((await coll.deleteOne({})).deletedCount);
    expect(0).toEqual((await coll.deleteOne({ hello: "world" })).deletedCount);

    const doc1 = { hello: "world" };
    const doc2 = { hello: "friend" };
    await coll.insertMany([doc1, doc2]);

    expect(1).toEqual((await coll.deleteOne({})).deletedCount);
    expect(1).toEqual((await coll.deleteOne({})).deletedCount);
    expect(0).toEqual((await coll.deleteOne({})).deletedCount);

    await coll.insertMany([doc1, doc2]);
    expect(1).toEqual((await coll.deleteOne(doc1)).deletedCount);
    expect(0).toEqual((await coll.deleteOne(doc1)).deletedCount);
    expect(1).toEqual(await coll.count());
    expect(0).toEqual(await coll.count(doc1));

    try {
      await coll.deleteOne({ $who: 1 });
      fail();
    } catch (error) {
      expect(error instanceof StitchServiceException);
      expect(StitchServiceErrorCode.MongoDBError).toEqual(error.errorCode);
    }
  });

  it("should delete many", async () => {
    const coll = getTestColl();
    expect(0).toEqual((await coll.deleteMany({})).deletedCount);
    expect(0).toEqual((await coll.deleteMany({ hello: "world" })).deletedCount);

    const doc1 = { hello: "world" };
    const doc2 = { hello: "friend" };
    await coll.insertMany([doc1, doc2]);

    expect(2).toEqual((await coll.deleteMany({})).deletedCount);
    expect(0).toEqual((await coll.deleteMany({})).deletedCount);

    await coll.insertMany([doc1, doc2]);
    expect(1).toEqual((await coll.deleteMany(doc1)).deletedCount);
    expect(0).toEqual((await coll.deleteMany(doc1)).deletedCount);
    expect(1).toEqual(await coll.count());
    expect(0).toEqual(await coll.count(doc1));

    try {
      await coll.deleteMany({ $who: 1 });
      fail();
    } catch (error) {
      expect(error instanceof StitchServiceException);
      expect(StitchServiceErrorCode.MongoDBError).toEqual(error.errorCode);
    }
  });

  it("should update one", async () => {
    const coll = getTestColl();
    const doc1 = { hello: "world" };
    let result = await coll.updateOne({}, doc1);
    expect(0).toEqual(result.matchedCount);
    expect(result.upsertedId).toBeUndefined();

    result = await coll.updateOne({}, doc1, { upsert: true });
    expect(0).toEqual(result.matchedCount);
    expect(result.upsertedId).toBeDefined();
    result = await coll.updateOne({}, { $set: { woof: "meow" } });
    expect(1).toEqual(result.matchedCount);
    expect(result.upsertedId).toBeUndefined();
    const expectedDoc = { hello: "world" };
    expectedDoc["woof"] = "meow";
    expect(expectedDoc).toEqual(
      withoutId((await coll.find({}).first()) as any)
    );

    try {
      await coll.updateOne({ $who: 1 }, {});
      fail();
    } catch (error) {
      expect(error instanceof StitchServiceException);
      expect(StitchServiceErrorCode.MongoDBError).toEqual(error.errorCode);
    }
  });

  it("should update many", async () => {
    const coll = getTestColl();
    const doc1 = { hello: "world" };
    let result = await coll.updateMany({}, doc1);
    expect(0).toEqual(result.matchedCount);
    expect(result.upsertedId).toBeUndefined();

    result = await coll.updateMany({}, doc1, { upsert: true });
    expect(0).toEqual(result.matchedCount);
    expect(result.upsertedId).toBeDefined();
    result = await coll.updateMany({}, { $set: { woof: "meow" } });
    expect(1).toEqual(result.matchedCount);
    expect(result.upsertedId).toBeUndefined();

    await coll.insertOne({});
    result = await coll.updateMany({}, { $set: { woof: "meow" } });
    expect(2).toEqual(result.matchedCount);

    const expectedDoc1 = { hello: "world" };
    expectedDoc1["woof"] = "meow";
    const expectedDoc2 = { woof: "meow" };
    expect([expectedDoc1, expectedDoc2]).toEqual(
      withoutIds(await coll.find({}).asArray())
    );

    try {
      await coll.updateOne({ $who: 1 }, {});
      fail();
    } catch (error) {
      expect(error instanceof StitchServiceException);
      expect(StitchServiceErrorCode.MongoDBError).toEqual(error.errorCode);
    }
  });

  it("should decode properly", async () => {
    interface CustomType {
      id?: ObjectID;
      intValue: number;
    }

    const codec = new class implements Codec<CustomType> {
      public decode(from: object): CustomType {
        return {
          id: from["_id"],
          intValue: from["intValue"]
        };
      }

      public encode(from: CustomType): object {
        return {
          _id: from.id,
          intValue: from.intValue
        };
      }
    }();

    let coll = getTestColl().withCollectionType(codec);

    const expected: CustomType = { id: new ObjectID(), intValue: 42 };

    expect(expected.id).toEqual((await coll.insertOne(expected)).insertedId);
    expect(expected).toEqual(await coll.find().first());

    coll = getTestColl(codec);

    const expected2: CustomType = { intValue: 42 };
    const result = await coll.insertOne(expected2);
    expect(expected.id).not.toEqual(result.insertedId);

    let actual = await coll.find().first();
    expect(expected2.intValue).toEqual(actual!.intValue);
    expect(expected.id).toBeDefined();

    const coll2 = getTestColl().withCollectionType(codec);
    actual = await coll2.find({}).first();
    expect(expected2.intValue).toEqual(actual!.intValue);
    expect(expected.id).toBeDefined();

    const iter = coll2.aggregate([{ $match: {} }]);
    expect((await iter.iterator()).next().value).toBeDefined();
    expect(expected).toEqual((await iter.iterator()).next().value);
  });
});
