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

import { ObjectID, ObjectId } from "bson";
import {
  Anon,
  App,
  AppResponse,
  Mongo,
  MongoDbRuleCreator,
  Service,
  ServiceResponse
} from "mongodb-stitch-core-admin-client";
import {
  AnonymousCredential,
  BSON,
  Codec,
  StitchServiceError,
  StitchServiceErrorCode
} from "mongodb-stitch-core-sdk";
import { BaseStitchRNIntTestHarness } from "mongodb-stitch-react-native-testutils";
import { RemoteMongoClient, RemoteMongoCollection } from "../src";

import { ChangeEvent } from "mongodb-stitch-core-services-mongodb-remote";

const mongodbUriProp = "TEST_STITCH_MONGODBURI";

let mongoClient: RemoteMongoClient;

let dbName: string;
let collName: string;

const mongodbUri: string = (() => {
  const prop = process.env[mongodbUriProp];
  return prop ? prop : "mongodb://localhost:26000";
})();

const harness = new BaseStitchRNIntTestHarness();

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
  return docs.map(withoutId);
}

function withoutId(doc: object): object {
  const newDoc = { ...doc };
  delete newDoc._id;
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

  const client = await harness.getAppClient(appResponse as AppResponse);
  await client.auth.loginWithCredential(new AnonymousCredential());
  mongoClient = client.getServiceClient(RemoteMongoClient.factory, "mongodb1");
});

describe("RemoteMongoClient", () => {
  it("should count", async () => {
    const coll = getTestColl();
    expect(0).toEqual(await coll.count());

    const rawDoc = { hello: "world" };
    const doc1 = { ...rawDoc };
    const doc2 = { ...rawDoc };
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
      expect(error instanceof StitchServiceError);
      expect(StitchServiceErrorCode.MongoDBError).toEqual(error.errorCode);
    }
  });

  it("should find", async () => {
    const coll = getTestColl();
    let iter = await coll.find();

    expect(await (await iter.iterator()).next()).toBeUndefined();
    expect(await iter.first()).toBeUndefined();

    const doc1 = { hello: "world" };
    const doc2 = { hello: "friend" };
    doc2.proj = "field";
    await coll.insertMany([doc1, doc2]);
    expect(await (await iter.iterator()).next()).toBeDefined();
    expect(withoutId(doc1)).toEqual(withoutId((await iter.first()) as any));
    expect(withoutId(doc2)).toEqual(
      withoutId(
        await (await coll
          .find(undefined, { limit: 1, sort: { _id: -1 } })
          .iterator()).next()
      )
    );

    iter = coll.find(doc1);
    expect(await (await iter.iterator()).next()).toBeDefined();
    expect(withoutId(doc1)).toEqual(
      withoutId(await (await iter.iterator()).next())
    );

    iter = await coll.find(doc1);
    expect(await (await iter.iterator()).next()).toBeDefined();
    expect(withoutId(doc1)).toEqual(
      withoutId(await (await iter.iterator()).next())
    );

    expect({ proj: "field" }).toEqual(
      withoutId(
        await (await coll.find(doc2, { projection: { proj: 1 } })
          .iterator())
          .next()
      )
    );

    let count = 0;
    (await coll.find().toArray()).forEach(_ => {
      count++;
    });
    expect(2).toEqual(count);

    expect(
      (await coll.find().toArray()).find(it => doc1.hello === it.hello)
    ).toBeDefined();

    expect([doc1, doc2]).toEqual(await coll.find().toArray());

    const asyncIter = await iter.iterator();
    expect(doc1).toEqual(await asyncIter.next());

    try {
      await coll.find({ $who: 1 }).first();
      fail();
    } catch (error) {
      expect(error instanceof StitchServiceError).toBeTruthy();
      expect(StitchServiceErrorCode.MongoDBError).toEqual(error.errorCode);
    }
  });

  it("should find one", async () => {
    const coll = getTestColl();

    let result = await coll.findOne();
    expect(result).toBeNull();

    const doc1 = { hello: "world" };
    await coll.insertOne(doc1);

    result = await coll.findOne();
    expect(result).toBeDefined();
    expect(withoutId(result)).toEqual(withoutId(doc1));

    
    const doc2 = { hello: "world2", other: "other" };
    await coll.insertOne(doc2);

    result = await coll.findOne({hello: "world"});
    expect(result).toBeDefined();
    expect(withoutId(result)).toEqual(withoutId(doc1));

    result = await coll.findOne({other: "other"})
    expect(result).toBeDefined();
    expect(withoutId(result)).toEqual(withoutId(doc2));

    result = await coll.findOne({notARealField: "bogus"});
    expect(result).toBeNull();

    result = await coll.findOne({}, {sort: {_id: 1}})
    expect(result).toBeDefined();
    expect(withoutId(result)).toEqual(withoutId(doc1));

    result = await coll.findOne({}, {sort: {_id: -1}})
    expect(result).toBeDefined();
    expect(withoutId(result)).toEqual(withoutId(doc2));

    result = await coll.findOne(doc2, {projection: {_id: 0}});
    expect(result).toBeDefined();
    expect(result).toEqual(withoutId(doc2));

    try {
      await coll.find({ $who: 1 }).first();
      fail();
    } catch (error) {
      expect(error instanceof StitchServiceError).toBeTruthy();
      expect(StitchServiceErrorCode.MongoDBError).toEqual(error.errorCode);
    }
  });

  it("should find one and update", async () => {
    const coll = getTestColl();

    // Collection should start out empty
    // This also tests the null return format
    let result = await coll.findOneAndUpdate({}, {});
    expect(result).toBeNull();

    // Insert Sample Document
    const doc1 = { hello: "world", num: 2 };
    await coll.insertOne(doc1);

    // Simple call to findOneAndUpdate() were we get the previous document back
    const update = {
      $inc: {num: 1},
      $set: {hello: "hellothere"}
    }
    result = await coll.findOneAndUpdate({hello: "world"}, update);
    expect(withoutId(result)).toEqual({hello: "world", num: 2});

    // Check to make sure the update took place
    result = await coll.findOne();
    expect(withoutId(result)).toEqual({hello: "hellothere", num: 3});

    // Call findOneAndUpdate() again but get the new document
    result = await coll.findOneAndUpdate(
      {hello: "hellothere"}, 
      {$inc: {num: 1}}, 
      {returnNewDocument: true}
    )
    expect(withoutId(result)).toEqual({hello: "hellothere", num: 4});
    result = await coll.findOne();
    expect(withoutId(result)).toEqual({hello: "hellothere", num: 4});

    // Test null behavior again with filter that should not match any docs
    result = await coll.findOneAndUpdate(
      {hello: "hellotherethisisnotakey"}, 
      {$inc: {num: 1}}, 
      {returnNewDocument: true}
    )
    expect(result).toBeNull();

    // Test the upsert option where it should not actually be invoked
    result = await coll.findOneAndUpdate(
      {hello: "hellothere"}, 
      {$set: {hello: "world1", num: 1}}, 
      {upsert: true, returnNewDocument: true}
    )
    expect(withoutId(result)).toEqual({hello: "world1", num: 1});
    let count = await coll.count();
    expect(count).toEqual(1);

    // Test the upsert option where the server should perform upsert and return new document
    result = await coll.findOneAndUpdate(
      {hello: "hello"}, 
      {$set: {hello: "world2", num: 2}}, 
      {upsert: true, returnNewDocument: true}
    )
    expect(withoutId(result)).toEqual({hello: "world2", num: 2})
    count = await coll.count();
    expect(count).toEqual(2);

    // Test the upsert option where the server should perform upsert and return old document
    // The old document should be empty
    result = await coll.findOneAndUpdate(
      {hello: "hello"}, 
      {$set: {hello: "world3", num: 3}}, 
      {upsert: true}
    )
    expect(result).toBeNull();
    count = await coll.count();
    expect(count).toEqual(3);

    // test sort and project
    result = await coll.findOneAndUpdate(
      {}, 
      {$inc: {num: 1}}, 
      {projection: {hello: 1, _id: 0}, sort: {num: -1}}
    )
    expect(result).toEqual({hello: "world3"})

    result = await coll.findOneAndUpdate(
      {}, 
      {$inc: {num: 1}}, 
      {projection: {hello: 1, _id: 0}, sort: {num: 1}}
    )
    expect(result).toEqual({hello: "world1"})
    
    // Should properly fail given illegal update doc
    try {
      await coll.findOneAndUpdate({}, {$who: {a: 1}})
      fail();
    } catch (error) {
      expect(error instanceof StitchServiceError).toBeTruthy();
      expect(StitchServiceErrorCode.MongoDBError).toEqual(error.errorCode);
    }
  });

  it("should find one and replace", async () => {
    const coll = getTestColl();

    // Collection should start out empty
    // This also tests the null return format
    let result = await coll.findOneAndReplace({}, {});
    expect(result).toBeNull();

    // Insert Sample Document
    const doc1 = { hello: "world", num: 1 };
    await coll.insertOne(doc1);

    // Simple call to findOneAndReplace() were we get the previous document
    result = await coll.findOneAndReplace({hello: "world"}, {hello: "world2", num: 2})
    expect(withoutId(result)).toEqual({hello: "world", num: 1});

    result = await coll.findOne();
    expect(withoutId(result)).toEqual({hello: "world2", num: 2});

    // Call findOneAndReplace() again but get the new document
    result = await coll.findOneAndReplace(
      {}, 
      {hello: "world3", num: 3}, 
      {returnNewDocument: true}
    )
    expect(withoutId(result)).toEqual({hello: "world3", num: 3});
    result = await coll.findOne();
    expect(withoutId(result)).toEqual({hello: "world3", num: 3});

    // Test null behavior again with filter that should not match any docs
    result = await coll.findOneAndReplace(
      {hello: "hellotherethisisnotakey"}, 
      {hello: "world4"}, 
      {returnNewDocument: true}
    )
    expect(result).toBeNull();

    // Test the upsert option where it should not actually be invoked
    result = await coll.findOneAndReplace(
      {hello: "world3"}, 
      {hello: "world4", num: 4}, 
      {upsert: true, returnNewDocument: true},
    )
    expect(withoutId(result)).toEqual( {hello: "world4", num: 4} );

    // Test the upsert option where the server should perform upsert and return new document
    result = await coll.findOneAndReplace(
      {hello: "world3"}, 
      {hello: "world5", num: 5}, 
      {upsert: true, returnNewDocument: true},
    )
    expect(withoutId(result)).toEqual( {hello: "world5", num: 5} );
    let count = await coll.count();
    expect(count).toEqual(2);

    // Test the upsert option where the server should perform upsert and return old document
    // The old document should be empty
    result = await coll.findOneAndReplace(
      {hello: "world3"}, 
      {hello: "world6", num: 6}, 
      {upsert: true},
    )
    expect(result).toBeNull();
    count = await coll.count();
    expect(count).toEqual(3);
    
    // Test sort and project
    result = await coll.findOneAndReplace(
      {}, 
      {hello: "oldworld", num: 100}, 
      {projection: {hello: 1, _id: 0}, sort: {num: -1}}
    )
    expect(result).toEqual({hello: "world6"})

    result = await coll.findOneAndReplace(
      {}, 
      {hello: "oldworld", num: 100}, 
      {projection: {hello: 1, _id: 0}, sort: {num: 1}}
    )
    expect(result).toEqual({hello: "world4"})
    
    // Should properly fail given an illegal replacement doc with update operations
    try {
      await coll.findOneAndReplace({}, {$inc: {a: 1}})
      fail();
    } catch (error) {
      expect(error instanceof StitchServiceError).toBeTruthy();
      expect(StitchServiceErrorCode.InvalidParameter).toEqual(error.errorCode);
    }
  });

  it("should find one and delete", async () => {
    const coll = getTestColl();

    // Collection should start out empty
    // This also tests the null return format
    let result = await coll.findOneAndDelete({});
    expect(result).toBeNull();

    // Insert Sample Document
    const doc1 = { hello: "world1", num: 1 };
    await coll.insertOne(doc1);
    let count = await coll.count();
    expect(count).toEqual(1);

    // Simple call to findOneAndDelete() where we delete the only document in the collection
    result = await coll.findOneAndDelete({})
    expect(withoutId(result)).toEqual({ hello: "world1", num: 1 });
    count = await coll.count();
    expect(count).toEqual(0);

    // Insert Sample Document
    await coll.insertOne(doc1);
    count = await coll.count();
    expect(count).toEqual(1);

    // Call findOneAndDelete() again but with filter
    result = await coll.findOneAndDelete({hello: "world1"})
    expect(withoutId(result)).toEqual({ hello: "world1", num: 1 });
    count = await coll.count();
    expect(count).toEqual(0);

    // Insert Sample Document
    await coll.insertOne(doc1);
    count = await coll.count();
    expect(count).toEqual(1);

    // Call findOneAndDelete() again but give it filter that does not match any documents
    result = await coll.findOneAndDelete({hello: "thisdoesntexist"})
    expect(result).toBeNull();
    count = await coll.count();
    expect(count).toEqual(1);
    
    // Put in more documents
    await coll.insertMany([
      {hello: "world2", num: 2}, 
      {hello: "world3", num: 3},
    ]);
    count = await coll.count();
    expect(count).toEqual(3);
    
    // Test sort and project
    result = await coll.findOneAndDelete({}, {projection: {hello: 1, _id: 0}, sort: {num: -1}});
    expect(result).toEqual({hello: "world3"})
    result = await coll.findOneAndDelete({}, {projection: {hello: 1, _id: 0}, sort: {num: 1}});
    expect(result).toEqual({hello: "world1"})
    
    // Should properly fail given an illegal replacement doc with update operations
    try {
      await coll.findOneAndReplace({}, {sort: {$inc: {a: 1}}})
      fail();
    } catch (error) {
      expect(error instanceof StitchServiceError).toBeTruthy();
      expect(StitchServiceErrorCode.MongoDBError).toEqual(error.errorCode);
    }
  });

  it("should aggregate", async () => {
    const coll = getTestColl();
    let iter = coll.aggregate([]);
    expect(await (await iter.iterator()).next()).toBeUndefined();
    expect(await iter.first()).toBeUndefined();

    const doc1 = { hello: "world" };
    const doc2 = { hello: "friend" };
    await coll.insertMany([doc1, doc2]);
    expect(await iter.first()).toBeDefined();
    expect(withoutId(doc1)).toEqual(withoutId((await iter.first()) as any));

    iter = coll.aggregate([{ $sort: { _id: -1 } }, { $limit: 1 }]);
    expect(withoutId(doc2)).toEqual(
      withoutId(await (await iter.iterator()).next())
    );

    iter = coll.aggregate([{ $match: doc1 }]);
    expect(await (await iter.iterator()).next()).toBeDefined();
    expect(withoutId(doc1)).toEqual(
      withoutId(await (await iter.iterator()).next())
    );

    try {
      await coll.aggregate([{ $who: 1 }]).first();
      fail();
    } catch (error) {
      expect(error instanceof StitchServiceError).toBeTruthy();
      expect(StitchServiceErrorCode.MongoDBError).toEqual(error.errorCode);
    }
  });

  it("should insert one", async () => {
    const coll = getTestColl();
    const doc = { hello: "world" };
    doc._id = new ObjectId();

    expect(doc._id).toEqual((await coll.insertOne(doc)).insertedId);
    try {
      await coll.insertOne(doc);
      fail();
    } catch (error) {
      expect(error instanceof StitchServiceError);
      expect(StitchServiceErrorCode.MongoDBError).toEqual(error.errorCode);
      expect((error.message as string).indexOf("duplicate")).toBeGreaterThan(0);
    }

    const doc2 = { hello: "world" };
    expect(doc._id).not.toEqual((await coll.insertOne(doc2)).insertedId);
  });

  it("should insert many", async () => {
    const coll = getTestColl();
    const doc1 = { hello: "world" };
    doc1._id = new ObjectID();

    expect(doc1._id).toEqual((await coll.insertMany([doc1])).insertedIds[0]);
    try {
      await coll.insertMany([doc1]);
    } catch (error) {
      expect(error instanceof StitchServiceError);
      expect(StitchServiceErrorCode.MongoDBError).toEqual(error.errorCode);
      expect((error.message as string).indexOf("duplicate")).toBeGreaterThan(0);
    }

    const doc2 = { hello: "world" };
    expect(doc1._id).not.toEqual(
      (await coll.insertMany([doc2])).insertedIds[0]
    );

    const doc3 = { one: "two" };
    const doc4 = { three: 4 };

    await coll.insertMany([doc3, doc4]);
    expect(withoutIds([doc1, doc2, doc3, doc4])).toEqual(
      withoutIds(await coll.find().toArray())
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
      expect(error instanceof StitchServiceError);
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
      expect(error instanceof StitchServiceError);
      expect(StitchServiceErrorCode.MongoDBError).toEqual(error.errorCode);
    }
  });

  it("should update one", async () => {
    const coll = getTestColl();
    const doc1 = { hello: "world" };
    let result = await coll.updateOne({}, doc1);
    expect(0).toEqual(result.matchedCount);
    expect(0).toEqual(result.modifiedCount);
    expect(result.upsertedId).toBeUndefined();

    result = await coll.updateOne({}, doc1, { upsert: true });
    expect(0).toEqual(result.matchedCount);
    expect(0).toEqual(result.modifiedCount);
    expect(result.upsertedId).toBeDefined();
    result = await coll.updateOne({}, { $set: { woof: "meow" } });
    expect(1).toEqual(result.matchedCount);
    expect(1).toEqual(result.modifiedCount);
    expect(result.upsertedId).toBeUndefined();
    const expectedDoc = { hello: "world" };
    expectedDoc.woof = "meow";
    expect(expectedDoc).toEqual(
      withoutId((await coll.find({}).first()) as any)
    );

    try {
      await coll.updateOne({ $who: 1 }, {});
      fail();
    } catch (error) {
      expect(error instanceof StitchServiceError);
      expect(StitchServiceErrorCode.MongoDBError).toEqual(error.errorCode);
    }
  });

  it("should update many", async () => {
    const coll = getTestColl();
    const doc1 = { hello: "world" };
    let result = await coll.updateMany({}, doc1);
    expect(0).toEqual(result.matchedCount);
    expect(0).toEqual(result.modifiedCount);
    expect(result.upsertedId).toBeUndefined();

    result = await coll.updateMany({}, doc1, { upsert: true });
    expect(0).toEqual(result.matchedCount);
    expect(0).toEqual(result.modifiedCount);
    expect(result.upsertedId).toBeDefined();
    result = await coll.updateMany({}, { $set: { woof: "meow" } });
    expect(1).toEqual(result.matchedCount);
    expect(1).toEqual(result.modifiedCount);
    expect(result.upsertedId).toBeUndefined();

    await coll.insertOne({});
    result = await coll.updateMany({}, { $set: { woof: "meow" } });
    expect(2).toEqual(result.matchedCount);
    expect(2).toEqual(result.modifiedCount);

    const expectedDoc1 = { hello: "world" };
    expectedDoc1.woof = "meow";
    const expectedDoc2 = { woof: "meow" };
    expect([expectedDoc1, expectedDoc2]).toEqual(
      withoutIds(await coll.find({}).toArray())
    );

    try {
      await coll.updateOne({ $who: 1 }, {});
      fail();
    } catch (error) {
      expect(error instanceof StitchServiceError);
      expect(StitchServiceErrorCode.MongoDBError).toEqual(error.errorCode);
    }
  });

  it("should decode properly", async () => {
    interface CustomType {
      id?: ObjectID;
      intValue: number;
    }

    const codec = new class implements Codec<CustomType> {
      public decode(from: any): CustomType {
        return {
          id: from._id,
          intValue: from.intValue
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
    expect(await (await iter.iterator()).next()).toBeDefined();
    expect(expected).toEqual(await (await iter.iterator()).next());
  });
});
