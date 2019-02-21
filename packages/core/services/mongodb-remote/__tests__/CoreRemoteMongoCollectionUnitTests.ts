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

import BSON from "bson";
import { CoreStitchServiceClientImpl } from "mongodb-stitch-core-sdk";
import { anything, capture, instance, mock, verify, when } from "ts-mockito";
import {
  CoreRemoteMongoClientImpl,
  CoreRemoteMongoCollectionImpl,
  RemoteInsertManyResult
} from "../src";
import ResultDecoders from "../src/internal/ResultDecoders";
import { getCollection } from "./TestUtils";

describe("CoreRemoteMongoCollection", () => {
  it("should get namespace", () => {
    const coll1 = getCollection();
    expect(coll1.namespace).toEqual("dbName1.collName1");

    const coll2 = getCollection("collName2");
    expect(coll2.namespace).toEqual("dbName1.collName2");
  });

  it("should test count", async () => {
    const serviceMock = mock(CoreStitchServiceClientImpl);
    const service = instance(serviceMock);
    const client = new CoreRemoteMongoClientImpl(service);
    const coll = getCollection(undefined, client);

    when(serviceMock.callFunction(anything(), anything())).thenResolve(
      42
    );

    expect(await coll.count()).toEqual(42);

    const [funcNameArg, funcArgsArg, resultClassArg]: any = capture(
      serviceMock.callFunction
    ).last();

    expect(funcNameArg).toEqual("count");
    expect((funcArgsArg as any[]).length).toBe(1);
    const expectedArgs = {
      collection: "collName1",
      database: "dbName1",
      query: {}
    };

    expect(funcArgsArg[0]).toEqual(expectedArgs);
    expect(resultClassArg).toBeUndefined();

    const expectedFilter = { one: 23 };
    expect(await coll.count(expectedFilter, { limit: 5 })).toEqual(42);

    verify(serviceMock.callFunction(anything(), anything())).times(2);
    const [funcNameArg2, funcArgsArg2, resultClassArg2]: any = capture(
      serviceMock.callFunction
    ).last();

    expect(funcNameArg2).toEqual("count");
    expect(funcArgsArg2.length).toBe(1);
    expectedArgs.database = "dbName1";
    expectedArgs.collection = "collName1";
    expectedArgs.query = expectedFilter;
    expectedArgs.limit = 5;
    expect(funcArgsArg2[0]).toEqual(expectedArgs);
    expect(resultClassArg2).toBeUndefined();

    // Should pass along errors
    when(serviceMock.callFunction(anything(), anything())).thenReject(
      new Error("whoops")
    );

    try {
      await coll.count();
      fail();
    } catch (_) {
      // Do nothing
    }
  });

  it("should find", async () => {
    const serviceMock = mock(CoreStitchServiceClientImpl);
    const service = instance(serviceMock);

    const client = new CoreRemoteMongoClientImpl(service);
    const coll = getCollection(undefined, client);

    const doc1 = { one: 2 };
    const doc2 = { three: 4 };

    const docs = [doc1, doc2];

    when(
      serviceMock.callFunction(anything(), anything(), anything())
    ).thenResolve(docs);

    let iter = await coll.find().iterator();

    expect(iter.next().value).toEqual(docs[0]);
    expect(iter.next().value).toEqual(docs[1]);

    const [funcNameArg, funcArgsArg, resultClassArg]: any[] = capture(
      serviceMock.callFunction
    ).last();

    expect(funcNameArg).toEqual("find");
    expect(funcArgsArg.length).toEqual(1);
    const expectedArgs = {
      collection: "collName1",
      database: "dbName1",
      query: {}
    };
    expect(funcArgsArg[0]).toEqual(expectedArgs);

    const expectedFilter = { one: 23 };
    const expectedProject = { two: "four" };
    const expectedSort = { _id: -1 };

    iter = await coll
      .find(expectedFilter, {
        limit: 5,
        projection: expectedProject,
        sort: expectedSort
      })
      .iterator();

    expect(iter.next().value).toEqual(docs[0]);
    expect(iter.next().value).toEqual(docs[1]);

    verify(
      serviceMock.callFunction(anything(), anything(), anything())
    ).times(2);

    const [funcNameArg2, funcArgsArg2, resultClassArg2]: any[] = capture(
      serviceMock.callFunction
    ).last();

    expect("find").toEqual(funcNameArg2);
    expect(1).toEqual(funcArgsArg2.length);
    expectedArgs.query = expectedFilter;
    expectedArgs.project = expectedProject;
    expectedArgs.sort = expectedSort;
    expectedArgs.limit = 5;

    expect(funcArgsArg2[0]).toEqual(expectedArgs);

    when(
      serviceMock.callFunction(anything(), anything(), anything())
    ).thenResolve([1, 2, 3]);

    iter = await coll.find(expectedFilter).iterator();
    expect(iter.next().value).toEqual(1);
    expect(iter.next().value).toEqual(2);
    expect(iter.next().value).toEqual(3);

    // Should pass along errors
    when(
      serviceMock.callFunction(anything(), anything(), anything())
    ).thenReject(new Error("whoops"));

    try {
      await coll.find().first();
      fail();
    } catch (_) {
      // Do nothing
    }
  });

  it("should find one", async () => {
    const serviceMock = mock(CoreStitchServiceClientImpl);
    const service = instance(serviceMock);

    const client = new CoreRemoteMongoClientImpl(service);
    const coll = getCollection(undefined, client);

    const doc = { one: 1, two: 2 };

    when(
      serviceMock.callFunction(anything(), anything(), anything())
    ).thenResolve(doc);

    let result = await coll.findOne();
    expect(result).toBeDefined();
    expect(result).toEqual(doc);

    const [funcNameArg, funcArgsArg, resultClassArg]: any[] = capture(
      serviceMock.callFunction
    ).last();

    expect(funcNameArg).toEqual("findOne");
    expect(funcArgsArg.length).toEqual(1);
    const expectedArgs = {
      collection: "collName1",
      database: "dbName1",
      query: {}
    };
    expect(funcArgsArg[0]).toEqual(expectedArgs);

    const expectedFilter = { one: 1 };
    const expectedProject = { two: "four" };
    const expectedSort = { _id: -1 };

    result = await coll.findOne(expectedFilter, {projection: expectedProject, sort: expectedSort});
    expect(result).toEqual(doc);

    verify(
      serviceMock.callFunction(anything(), anything(), anything())
    ).times(2);

    const [funcNameArg2, funcArgsArg2, resultClassArg2]: any[] = capture(
      serviceMock.callFunction
    ).last();

    expect("findOne").toEqual(funcNameArg2);
    expect(1).toEqual(funcArgsArg2.length);
    expectedArgs.query = expectedFilter;
    expectedArgs.project = expectedProject;
    expectedArgs.sort = expectedSort;
    expect(funcArgsArg2[0]).toEqual(expectedArgs);

    // Should pass along errors
    when(
      serviceMock.callFunction(anything(), anything(), anything())
    ).thenReject(new Error("whoops"));

    try {
      await coll.find().first();
      fail();
    } catch (_) {
      // Do nothing
    }
  });

  it("should aggregate", async () => {
    const serviceMock = mock(CoreStitchServiceClientImpl);
    const service = instance(serviceMock);

    const client = new CoreRemoteMongoClientImpl(service);
    const coll = getCollection(undefined, client);

    const doc1 = { one: 2 };
    const doc2 = { three: 4 };

    const docs = [doc1, doc2];

    when(
      serviceMock.callFunction(anything(), anything(), anything())
    ).thenResolve(docs);

    let iter = await coll.aggregate([]).iterator();

    expect(iter.next().value).toEqual(docs[0]);
    expect(iter.next().value).toEqual(docs[1]);

    const [funcNameArg, funcArgsArg, resultClassArg]: any[] = capture(
      serviceMock.callFunction
    ).last();

    expect(funcNameArg).toEqual("aggregate");
    expect(funcArgsArg.length).toEqual(1);
    const expectedArgs = {};
    expectedArgs.database = "dbName1";
    expectedArgs.collection = "collName1";
    expectedArgs.pipeline = [];
    expect(funcArgsArg[0]).toEqual(expectedArgs);

    const expectedProject = { two: "four" };
    const expectedSort = { _id: -1 };

    iter = await coll.aggregate([{ $match: 1 }, { sort: 2 }]).iterator();

    const expectedPipeline = [{ $match: 1 }, { sort: 2 }];

    expect(iter.next().value).toEqual(docs[0]);
    expect(iter.next().value).toEqual(docs[1]);

    verify(
      serviceMock.callFunction(anything(), anything(), anything())
    ).times(2);

    const [funcNameArg2, funcArgsArg2, resultClassArg2]: any[] = capture(
      serviceMock.callFunction
    ).last();

    expect("aggregate").toEqual(funcNameArg2);
    expect(1).toEqual(funcArgsArg2.length);
    expectedArgs.pipeline = expectedPipeline;
    expect(expectedArgs).toEqual(funcArgsArg2[0]);

    // Should pass along errors
    when(
      serviceMock.callFunction(anything(), anything(), anything())
    ).thenReject(new Error("whoops"));

    try {
      await coll.aggregate([]).first();
      fail();
    } catch (_) {
      // Do nothing
    }
  });

  it("should insert one", async () => {
    const serviceMock = mock(CoreStitchServiceClientImpl);
    const service = instance(serviceMock);

    const client = new CoreRemoteMongoClientImpl(service);
    const coll = getCollection(undefined, client);

    const id = new BSON.ObjectID();
    const doc1 = { one: 2, _id: id.toHexString() };

    when(
      serviceMock.callFunction(anything(), anything(), anything())
    ).thenResolve({ insertedId: id });

    const result = await coll.insertOne(doc1);

    expect(id).toEqual(result.insertedId);
    expect(id.toHexString()).toEqual(doc1._id);

    const [funcNameArg, funcArgsArg, resultClassArg]: any[] = capture(
      serviceMock.callFunction
    ).last();

    expect("insertOne").toEqual(funcNameArg);
    expect(1).toEqual(funcArgsArg.length);
    const expectedArgs = {
      collection: "collName1",
      database: "dbName1",
      document: doc1
    };
    expect(expectedArgs).toEqual(funcArgsArg[0]);
    expect(ResultDecoders.remoteInsertOneResultDecoder).toEqual(resultClassArg);

    // Should pass along errors
    when(
      serviceMock.callFunction(anything(), anything(), anything())
    ).thenReject(new Error("whoops"));

    try {
      await coll.insertOne({});
      fail();
    } catch (_) {
      // Do nothing
    }
  });

  it("should insert many", async () => {
    const serviceMock = mock(CoreStitchServiceClientImpl);
    const service = instance(serviceMock);

    const client = new CoreRemoteMongoClientImpl(service);
    const coll = getCollection(undefined, client);

    const id1 = new BSON.ObjectID();
    const id2 = new BSON.ObjectID();

    const doc1 = { one: 2, _id: id1.toHexString() };
    const doc2 = { three: 4, _id: id2.toHexString() };

    const ids = {
      0: id1.toHexString(),
      1: id2.toHexString()
    };

    when(
      serviceMock.callFunction(anything(), anything(), anything())
    ).thenResolve({ insertedIds: ids });

    const result = await coll.insertMany([doc1, doc2]);
    expect(ids).toEqual(result.insertedIds);

    const [funcNameArg, funcArgsArg, resultClassArg]: any[] = capture(
      serviceMock.callFunction
    ).last();

    expect("insertMany").toEqual(funcNameArg);
    expect(1).toEqual(funcArgsArg.length);
    const expectedArgs = {
      collection: "collName1",
      database: "dbName1",
      documents: [doc1, doc2]
    };

    expect(expectedArgs).toEqual(funcArgsArg[0]);
    expect(ResultDecoders.remoteInsertManyResultDecoder).toEqual(
      resultClassArg
    );

    // Should pass along errors
    when(
      serviceMock.callFunction(anything(), anything(), anything())
    ).thenReject(new Error("whoops"));

    try {
      await coll.insertMany([{}]);
      fail();
    } catch (_) {
      // Do nothing
    }
  });

  it("should delete one", async () => {
    const serviceMock = mock(CoreStitchServiceClientImpl);
    const service = instance(serviceMock);

    const client = new CoreRemoteMongoClientImpl(service);
    const coll = getCollection(undefined, client);

    when(
      serviceMock.callFunction(anything(), anything(), anything())
    ).thenResolve({ deletedCount: 1 });

    const expectedFilter = { one: 2 };
    const result = await coll.deleteOne(expectedFilter);
    expect(1).toEqual(result.deletedCount);

    const [funcNameArg, funcArgsArg, resultClassArg]: any[] = capture(
      serviceMock.callFunction
    ).last();

    expect("deleteOne").toEqual(funcNameArg);
    expect(1).toEqual(funcArgsArg.length);
    const expectedArgs = {
      collection: "collName1",
      database: "dbName1",
      query: expectedFilter
    };

    expect(expectedArgs).toEqual(funcArgsArg[0]);
    expect(ResultDecoders.remoteDeleteResultDecoder).toEqual(resultClassArg);

    // Should pass along errors
    when(
      serviceMock.callFunction(anything(), anything(), anything())
    ).thenReject(new Error("whoops"));

    try {
      await coll.deleteOne({});
      fail();
    } catch (_) {
      // Do nothing
    }
  });

  it("should delete many", async () => {
    const serviceMock = mock(CoreStitchServiceClientImpl);
    const service = instance(serviceMock);

    const client = new CoreRemoteMongoClientImpl(service);
    const coll = getCollection(undefined, client);

    when(
      serviceMock.callFunction(anything(), anything(), anything())
    ).thenResolve({ deletedCount: 1 });

    const expectedFilter = { one: 2 };
    const result = await coll.deleteMany(expectedFilter);
    expect(1).toEqual(result.deletedCount);

    const [funcNameArg, funcArgsArg, resultClassArg]: any[] = capture(
      serviceMock.callFunction
    ).last();

    expect("deleteMany").toEqual(funcNameArg);
    expect(1).toEqual(funcArgsArg.length);
    const expectedArgs = {
      collection: "collName1",
      database: "dbName1",
      query: expectedFilter
    };

    expect(expectedArgs).toEqual(funcArgsArg[0]);
    expect(ResultDecoders.remoteDeleteResultDecoder).toEqual(resultClassArg);

    // Should pass along errors
    when(
      serviceMock.callFunction(anything(), anything(), anything())
    ).thenReject(new Error("whoops"));
    try {
      await coll.deleteMany({});
      fail();
    } catch (_) {
      // Do nothing
    }
  });

  it("should update one", async () => {
    const serviceMock = mock(CoreStitchServiceClientImpl);
    const service = instance(serviceMock);
    const client = new CoreRemoteMongoClientImpl(service);
    const coll = getCollection(undefined, client);

    const id = new BSON.ObjectID();

    when(
      serviceMock.callFunction(anything(), anything(), anything())
    ).thenResolve({
      matchedCount: 1,
      modifiedCount: 1,
      upsertedId: id.toHexString()
    });

    const expectedFilter = { one: 2 };
    const expectedUpdate = { three: 4 };
    let result = await coll.updateOne(expectedFilter, expectedUpdate);
    expect(1).toEqual(result.matchedCount);
    expect(1).toEqual(result.modifiedCount);
    expect(id.toHexString()).toEqual(result.upsertedId);

    const [funcNameArg, funcArgsArg, resultClassArg]: any[] = capture(
      serviceMock.callFunction
    ).last();

    expect("updateOne").toEqual(funcNameArg);
    expect(1).toEqual(funcArgsArg.length);
    const expectedArgs = {
      collection: "collName1",
      database: "dbName1",
      query: expectedFilter,
      update: expectedUpdate
    };

    expect(expectedArgs).toEqual(funcArgsArg[0]);
    expect(ResultDecoders.remoteUpdateResultDecoder).toEqual(resultClassArg);

    result = await coll.updateOne(expectedFilter, expectedUpdate, {
      upsert: true
    });
    expect(1).toEqual(result.matchedCount);
    expect(1).toEqual(result.modifiedCount);
    expect(id.toHexString()).toEqual(result.upsertedId);

    verify(
      serviceMock.callFunction(anything(), anything(), anything())
    ).times(2);

    const [funcNameArg2, funcArgsArg2, resultClassArg2]: any[] = capture(
      serviceMock.callFunction
    ).last();

    expect("updateOne").toEqual(funcNameArg2);
    expect(1).toEqual(funcArgsArg2.length);
    expectedArgs.upsert = true;
    expect(expectedArgs).toEqual(funcArgsArg2[0]);
    expect(ResultDecoders.remoteUpdateResultDecoder).toEqual(resultClassArg2);

    // Should pass along errors
    when(
      serviceMock.callFunction(anything(), anything(), anything())
    ).thenReject(new Error("whoops"));
    try {
      await coll.updateOne({}, {});
      fail();
    } catch (_) {
      // Do nothing
    }
  });

  it("should update many", async () => {
    const serviceMock = mock(CoreStitchServiceClientImpl);
    const service = instance(serviceMock);
    const client = new CoreRemoteMongoClientImpl(service);
    const coll = getCollection(undefined, client);

    const id = new BSON.ObjectID();

    when(
      serviceMock.callFunction(anything(), anything(), anything())
    ).thenResolve({
      matchedCount: 1,
      modifiedCount: 1,
      upsertedId: id.toHexString()
    });

    const expectedFilter = { one: 2 };
    const expectedUpdate = { three: 4 };
    let result = await coll.updateMany(expectedFilter, expectedUpdate);
    expect(1).toEqual(result.matchedCount);
    expect(1).toEqual(result.modifiedCount);
    expect(id.toHexString()).toEqual(result.upsertedId);

    const [funcNameArg, funcArgsArg, resultClassArg]: any[] = capture(
      serviceMock.callFunction
    ).last();

    expect("updateMany").toEqual(funcNameArg);
    expect(1).toEqual(funcArgsArg.length);
    const expectedArgs = {};
    expectedArgs.database = "dbName1";
    expectedArgs.collection = "collName1";
    expectedArgs.query = expectedFilter;
    expectedArgs.update = expectedUpdate;
    expect(expectedArgs).toEqual(funcArgsArg[0]);
    expect(ResultDecoders.remoteUpdateResultDecoder).toEqual(resultClassArg);

    result = await coll.updateMany(expectedFilter, expectedUpdate, {
      upsert: true
    });
    expect(1).toEqual(result.matchedCount);
    expect(1).toEqual(result.modifiedCount);
    expect(id.toHexString()).toEqual(result.upsertedId);

    verify(
      serviceMock.callFunction(anything(), anything(), anything())
    ).times(2);

    const [funcNameArg2, funcArgsArg2, resultClassArg2]: any[] = capture(
      serviceMock.callFunction
    ).last();

    expect("updateMany").toEqual(funcNameArg2);
    expect(1).toEqual(funcArgsArg2.length);
    expectedArgs.upsert = true;
    expect(expectedArgs).toEqual(funcArgsArg2[0]);
    expect(ResultDecoders.remoteUpdateResultDecoder).toEqual(resultClassArg);

    // Should pass along errors
    when(
      serviceMock.callFunction(anything(), anything(), anything())
    ).thenReject(new Error("whoops"));
    try {
      await coll.updateMany({}, {});
      fail();
    } catch (_) {
      // Do nothing
    }
  });
});
