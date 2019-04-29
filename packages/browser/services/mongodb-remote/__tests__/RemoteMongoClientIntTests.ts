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

import { BaseStitchBrowserIntTestHarness } from "mongodb-stitch-browser-testutils";
import {
  Anon,
  App,
  AppResource,
  MongoDbRule,
  MongoDbService,
  Role,
  Schema,
  Service
} from "mongodb-stitch-core-admin-client";
import {
  AnonymousCredential,
  BSON,
  Codec,
  StitchServiceError,
  StitchServiceErrorCode
} from "mongodb-stitch-core-sdk";
import { 
  ChangeEvent,
  CompactChangeEvent,
  OperationType
} from "mongodb-stitch-core-services-mongodb-remote";
import { RemoteMongoClient, RemoteMongoCollection } from "../src";

/*
 * TODO: The jest test environment is node-based, so we require the use of a 
 * polyfill for the test to pass. Ideally in the future we should run this test 
 * in an actual browser with something like Selenium.
 */
import EventSourcePolyfill from "eventsource"
/* tslint:disable:no-string-literal */
window["EventSource"] = EventSourcePolyfill
/* tslint:enable:no-string-literal */

const mongodbUriProp = "TEST_STITCH_MONGODBURI";

let mongoClient: RemoteMongoClient;

let dbName: string;
let collName: string;

const mongodbUri: string = (() => {
  const prop = process.env[mongodbUriProp];
  return prop ? prop : "mongodb://localhost:26000";
})();

const harness = new BaseStitchBrowserIntTestHarness();

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

  dbName = new BSON.ObjectID().toHexString();
  collName = new BSON.ObjectId().toHexString();

  const { app: appResponse, appResource: app } = await harness.createApp();
  await harness.addProvider(app, new Anon());
  const [_, svc] = await harness.addService(app, new MongoDbService({ uri: mongodbUri }));
  await harness.addRule(
    svc,
    new MongoDbRule(
      dbName,
      collName,
      [new Role()],
      new Schema()
  ));
  const client = harness.getAppClient(appResponse);
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

    // Simple call to findOneAndUpdate() where we get the previous document back
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

    // Simple call to findOneAndReplace() where we get the previous document
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
    doc._id = new BSON.ObjectId();

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
    doc1._id = new BSON.ObjectID();

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
      id?: BSON.ObjectID;
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

    const expected: CustomType = { id: new BSON.ObjectID(), intValue: 42 };

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

  /* tslint:disable:no-string-literal */
  it("should properly support watch streams", async () => {
    const coll = getTestColl();
    
    const doc1 = { _id: new BSON.ObjectID(), hello: "world" };
    expect(doc1._id).toEqual((await coll.insertOne(doc1)).insertedId);

    // Should receive one event for one document
    const stream1 = await coll.watch([doc1._id]);
    stream1.onNext((event: ChangeEvent<any>) => {
      expect(event.documentKey["_id"]).toEqual(doc1._id);
      expect(event.operationType).toEqual("update");
      expect(event.fullDocument["hello"]).toEqual("universe");

      stream1.close();
    });
    await coll.updateOne({_id: doc1._id}, {$set: { hello: "universe"}});

    // Should receive multiple events for one document
    const doc2 = { _id: "this is a string id", hello: "galaxy"};
    const stream2 = await coll.watch([doc2._id]);

    stream2.next().then(event => {
      expect(event.documentKey["_id"]).toEqual(doc2._id);
      expect(event.operationType).toEqual("insert");
      expect(event.fullDocument).toEqual(doc2);  
    });
    await coll.insertOne(doc2);
    
    stream2.next().then(event => {
      expect(event.documentKey["_id"]).toEqual(doc2._id);
      expect(event.operationType).toEqual("update");
      expect(event.fullDocument["hello"]).toEqual("universe");
    });
    await coll.updateOne({_id: doc2._id}, {$set: { hello: "universe"}})

    // Should receive no more events after stream closed
    stream2.onNext(() => fail("should not have received event"))
    stream2.close();
    await coll.updateOne({_id: doc2._id}, {$set: { goodbye: "universe"}});

    // Should receive events for multiple documents watched
    const stream3 = await coll.watch([doc1._id, doc2._id]);

    const listener = {
      gotDoc1Event: false,
      gotDoc2Event: false,
      onNext(event: ChangeEvent<any>) { 
        const eventDocId = event.documentKey["_id"];
        if (doc1._id.equals(eventDocId))  {
          if (this.gotDoc1Event) {
            fail("got event for doc1 more than once");
          }
          this.gotDoc1Event = true
          expect(event.operationType).toEqual("update");
          expect(event.fullDocument["hello"]).toEqual("multiverse");
        } else if (eventDocId === doc2._id) {
          if (this.gotDoc2Event) {
            fail("got event for doc2 more than once");
          }
          this.gotDoc2Event = true
          expect(event.operationType).toEqual("update");
          expect(event.fullDocument["hello"]).toEqual("multiverse");
        } else {
          fail(`event for unexpected document: ${BSON.EJSON.stringify(event)}`);
        }

        // Close the stream once we've received both events
        if (this.gotDoc1Event && this.gotDoc2Event) {
          stream3.close();
        }
      },
      onError(error: Error) {
        fail("unexpected error in stream");
      }
    }

    stream3.addListener(listener);

    await coll.updateMany({}, { $set: {hello: "multiverse"}});
  });

  it("compact watch streams should include full document for inserts", async () => {
    const coll = getTestColl();

    const doc1 = { _id: new BSON.ObjectID(), hello: "world" };
  
    const stream1 = await coll.watchCompact([doc1._id]);
    stream1.onNext((event: CompactChangeEvent<any>) => {
      expect(event.documentKey["_id"]).toEqual(doc1._id);
      expect(event.operationType).toEqual(OperationType.Insert);
      expect(event.fullDocument).toMatchObject(doc1);

      stream1.close();
    });

    expect(doc1._id).toEqual((await coll.insertOne(doc1)).insertedId);
  });

  it("compact watch streams should exclude full document for updates", async () => {
    const coll = getTestColl();

    const doc1 = { _id: new BSON.ObjectID(), hello: "world" };
    expect(doc1._id).toEqual((await coll.insertOne(doc1)).insertedId);

    const stream1 = await coll.watchCompact([doc1._id]);
    stream1.onNext((event: CompactChangeEvent<any>) => {
      expect(event.documentKey["_id"]).toEqual(doc1._id);
      expect(event.operationType).toEqual(OperationType.Update);
      expect(event.fullDocument).toBeUndefined();

      stream1.close();
    });
    await coll.updateOne({_id: doc1._id}, {$set: { hello: "universe"}});
  });

  it("compact watch streams should include detailed update description for updates", async () => {
    const coll = getTestColl();

    const doc1 = { 
      _id: new BSON.ObjectID(),
      greetings: "we come in peace",
      hello: "world",
    };
    expect(doc1._id).toEqual((await coll.insertOne(doc1)).insertedId);

    const stream1 = await coll.watchCompact([doc1._id]);
    stream1.onNext((event: CompactChangeEvent<any>) => {
      expect(event.documentKey["_id"]).toEqual(doc1._id);
      expect(event.operationType).toEqual(OperationType.Update);
      
      expect(event.updateDescription.updatedFields["hello"]).toEqual("universe");
      expect(event.updateDescription.removedFields.length).toEqual(1);
      expect(
        event.updateDescription.removedFields.includes("greetings")
      ).toBeTruthy();

      stream1.close();
    });

    await coll.updateOne(
      {_id: doc1._id}, 
      {
        $set: { hello: "universe"},
        $unset: { greetings: "" }
      }
    );
  });

  it("compact watch streams should exclude document version when not present", async () => {
    const coll = getTestColl();

    const doc1 = { _id: new BSON.ObjectID(), hello: "world" };
    expect(doc1._id).toEqual((await coll.insertOne(doc1)).insertedId);

    const stream1 = await coll.watchCompact([doc1._id]);
    stream1.onNext((event: CompactChangeEvent<any>) => {
      expect(event.documentKey["_id"]).toEqual(doc1._id);
      expect(event.operationType).toEqual(OperationType.Update);
      
      expect(event.stitchDocumentVersion).toBeUndefined();

      stream1.close();
    });

    await coll.updateOne({_id: doc1._id}, {$set: { hello: "universe"}});
  });

  it("compact watch streams should include document version when not present", async () => {
    const coll = getTestColl();

    const doc1 = { 
      __stitch_sync_version: { 
        id: (new BSON.ObjectID()).toHexString(), spv: 1, v: 3
      },
      _id: new BSON.ObjectID(), 
      hello: "world",
    };
    expect(doc1._id).toEqual((await coll.insertOne(doc1)).insertedId);

    const stream1 = await coll.watchCompact([doc1._id]);
    stream1.onNext((event: CompactChangeEvent<any>) => {
      expect(event.documentKey["_id"]).toEqual(doc1._id);
      expect(event.operationType).toEqual(OperationType.Update);
      
      expect(event.stitchDocumentVersion).toMatchObject(
        doc1.__stitch_sync_version
      );

      stream1.close();
    });

    await coll.updateOne({_id: doc1._id}, {$set: { hello: "universe"}});
  });

  it("compact watch streams should include document hash for updates and inserts", async () => {
    const coll = getTestColl();

    const doc1 = {
      __stitch_sync_version: { 
        id: (new BSON.ObjectID()).toHexString(), spv: 1, v: 3
      },
      _id: new BSON.ObjectID(), 
      hello: "world",
    };

    const stream1 = await coll.watchCompact([doc1._id]);
    stream1.onNext((event: CompactChangeEvent<any>) => {
      expect(event.documentKey["_id"]).toEqual(doc1._id);
      expect(event.stitchDocumentHash).toBeDefined();

      stream1.close();
    });

    await coll.insertOne(doc1)
    await coll.updateOne({_id: doc1._id}, {$set: { hello: "universe"}});
  });

  it("compact watch streams should exclude document hash for deletes", async () => {
    const coll = getTestColl();

    const doc1 = {
      __stitch_sync_version: { 
        id: (new BSON.ObjectID()).toHexString(), spv: 1, v: 3
      },
      _id: new BSON.ObjectID(), 
      hello: "world",
    };

    await coll.insertOne(doc1)

    const stream1 = await coll.watchCompact([doc1._id]);
    stream1.onNext((event: CompactChangeEvent<any>) => {
      expect(event.documentKey["_id"]).toEqual(doc1._id);
      expect(event.operationType).toEqual(OperationType.Delete);
      expect(event.stitchDocumentHash).toBeUndefined();

      stream1.close();
    });

    await coll.deleteOne({_id: doc1._id});
  });
  /* tslint:enable:no-string-literal */

  it("issuing request with logged out user should reject promise", async () => {
    const coll = getTestColl();

    expect(coll.findOne()).resolves.toBeNull();

    expect(harness.clients[0].auth.isLoggedIn).toEqual(true);
    await harness.clients[0].auth.logout()
    expect(harness.clients[0].auth.isLoggedIn).toEqual(false);

    expect(coll.findOne()).rejects.toBeTruthy();
  });
});
