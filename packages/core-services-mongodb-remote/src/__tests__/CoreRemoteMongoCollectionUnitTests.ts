import { ObjectID } from "bson";
import { CoreStitchServiceClientImpl } from "stitch-core";
import {
  anything,
  capture,
  instance,
  mock,
  verify,
  when
} from "ts-mockito/lib/ts-mockito";
import {
  CoreRemoteMongoClientImpl,
  CoreRemoteMongoCollectionImpl,
  RemoteInsertManyResult
} from "../lib";
import ResultDecoders from "../lib/internal/ResultDecoders";
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

    when(serviceMock.callFunctionInternal(anything(), anything())).thenResolve(
      42
    );

    expect(await coll.count()).toEqual(42);

    const [funcNameArg, funcArgsArg, resultClassArg]: any = capture(
      serviceMock.callFunctionInternal
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

    verify(serviceMock.callFunctionInternal(anything(), anything())).times(2);
    const [funcNameArg2, funcArgsArg2, resultClassArg2]: any = capture(
      serviceMock.callFunctionInternal
    ).last();

    expect(funcNameArg2).toEqual("count");
    expect(funcArgsArg2.length).toBe(1);
    expectedArgs["database"] = "dbName1";
    expectedArgs["collection"] = "collName1";
    expectedArgs["query"] = expectedFilter;
    expectedArgs["limit"] = 5;
    expect(funcArgsArg2[0]).toEqual(expectedArgs);
    expect(resultClassArg2).toBeUndefined();

    // Should pass along errors
    when(serviceMock.callFunctionInternal(anything(), anything())).thenReject(
      new Error("whoops")
    );

    try {
      await coll.count();
      fail();
    } catch (_) {}
  });

  it("should find", async () => {
    const serviceMock = mock(CoreStitchServiceClientImpl);
    const service = instance(serviceMock);

    const client = new CoreRemoteMongoClientImpl(service);
    const coll = getCollection(undefined, client);

    const doc1 = { one: 2 };
    const doc2 = { three: 4 };

    const docs = [doc1, doc2];

    when(serviceMock.callFunctionInternal(anything(), anything(), anything())).thenResolve(
      docs
    );

    let iter = await coll.find().iterator();

    expect(iter.next().value).toEqual(docs[0]);
    expect(iter.next().value).toEqual(docs[1]);

    const [funcNameArg, funcArgsArg, resultClassArg]: any[] = capture(
      serviceMock.callFunctionInternal
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

    verify(serviceMock.callFunctionInternal(anything(), anything(), anything())).times(2);

    const [funcNameArg2, funcArgsArg2, resultClassArg2]: any[] = capture(
      serviceMock.callFunctionInternal
    ).last();

    expect("find").toEqual(funcNameArg2);
    expect(1).toEqual(funcArgsArg2.length);
    expectedArgs["query"] = expectedFilter;
    expectedArgs["project"] = expectedProject;
    expectedArgs["sort"] = expectedSort;
    expectedArgs["limit"] = 5;

    expect(funcArgsArg2[0]).toEqual(expectedArgs);

    when(serviceMock.callFunctionInternal(anything(), anything(), anything())).thenResolve([
      1,
      2,
      3
    ]);

    iter = await coll.find(expectedFilter).iterator();
    expect(iter.next().value).toEqual(1);
    expect(iter.next().value).toEqual(2);
    expect(iter.next().value).toEqual(3);

    // Should pass along errors
    when(serviceMock.callFunctionInternal(anything(), anything(), anything())).thenReject(
      new Error("whoops")
    );

    try {
      await coll.find().first();
      fail();
    } catch (_) {}
  });

  it("should aggregate", async () => {
    const serviceMock = mock(CoreStitchServiceClientImpl);
    const service = instance(serviceMock);

    const client = new CoreRemoteMongoClientImpl(service);
    const coll = getCollection(undefined, client);

    const doc1 = { one: 2 };
    const doc2 = { three: 4 };

    const docs = [doc1, doc2];

    when(serviceMock.callFunctionInternal(anything(), anything(), anything())).thenResolve(
      docs
    );

    let iter = await coll.aggregate([]).iterator();

    expect(iter.next().value).toEqual(docs[0]);
    expect(iter.next().value).toEqual(docs[1]);

    const [funcNameArg, funcArgsArg, resultClassArg]: any[] = capture(
      serviceMock.callFunctionInternal
    ).last();

    expect(funcNameArg).toEqual("aggregate");
    expect(funcArgsArg.length).toEqual(1);
    const expectedArgs = {};
    expectedArgs["database"] = "dbName1";
    expectedArgs["collection"] = "collName1";
    expectedArgs["pipeline"] = [];
    expect(funcArgsArg[0]).toEqual(expectedArgs);

    const expectedProject = { two: "four" };
    const expectedSort = { _id: -1 };

    iter = await coll.aggregate([{ $match: 1 }, { sort: 2 }]).iterator();

    const expectedPipeline = [{ $match: 1 }, { sort: 2 }];

    expect(iter.next().value).toEqual(docs[0]);
    expect(iter.next().value).toEqual(docs[1]);

    verify(serviceMock.callFunctionInternal(anything(), anything(), anything())).times(2);

    const [funcNameArg2, funcArgsArg2, resultClassArg2]: any[] = capture(
      serviceMock.callFunctionInternal
    ).last();

    expect("aggregate").toEqual(funcNameArg2);
    expect(1).toEqual(funcArgsArg2.length);
    expectedArgs["pipeline"] = expectedPipeline;
    expect(expectedArgs).toEqual(funcArgsArg2[0]);

    // Should pass along errors
    when(serviceMock.callFunctionInternal(anything(), anything(), anything())).thenReject(
      new Error("whoops")
    );

    try {
      await coll.aggregate([]).first();
      fail();
    } catch (_) {}
  });

  it("should insert one", async () => {
    const serviceMock = mock(CoreStitchServiceClientImpl);
    const service = instance(serviceMock);

    const client = new CoreRemoteMongoClientImpl(service);
    const coll = getCollection(undefined, client);

    const id = new ObjectID();
    const doc1 = { one: 2, _id: id.toHexString() };

    when(
      serviceMock.callFunctionInternal(anything(), anything(), anything())
    ).thenResolve({ insertedId: id });

    const result = await coll.insertOne(doc1);

    expect(id).toEqual(result.insertedId);
    expect(id.toHexString()).toEqual(doc1["_id"]);

    const [funcNameArg, funcArgsArg, resultClassArg]: any[] = capture(
      serviceMock.callFunctionInternal
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
      serviceMock.callFunctionInternal(anything(), anything(), anything())
    ).thenReject(new Error("whoops"));

    try {
      await coll.insertOne({});
      fail();
    } catch (_) {}
  });

  it("should insert many", async () => {
    const serviceMock = mock(CoreStitchServiceClientImpl);
    const service = instance(serviceMock);

    const client = new CoreRemoteMongoClientImpl(service);
    const coll = getCollection(undefined, client);

    const id1 = new ObjectID();
    const id2 = new ObjectID();

    const doc1 = { one: 2, _id: id1.toHexString() };
    const doc2 = { three: 4, _id: id2.toHexString() };

    const ids = {
      0: id1.toHexString(),
      1: id2.toHexString()
    };

    when(
      serviceMock.callFunctionInternal(anything(), anything(), anything())
    ).thenResolve({ insertedIds: ids });

    const result = await coll.insertMany([doc1, doc2]);
    expect(ids).toEqual(result.insertedIds);

    const [funcNameArg, funcArgsArg, resultClassArg]: any[] = capture(
      serviceMock.callFunctionInternal
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
      serviceMock.callFunctionInternal(anything(), anything(), anything())
    ).thenReject(new Error("whoops"));

    try {
      await coll.insertMany([{}]);
      fail();
    } catch (_) {}
  });

  it("should delete one", async () => {
    const serviceMock = mock(CoreStitchServiceClientImpl);
    const service = instance(serviceMock);

    const client = new CoreRemoteMongoClientImpl(service);
    const coll = getCollection(undefined, client);

    when(
      serviceMock.callFunctionInternal(anything(), anything(), anything())
    ).thenResolve({ deletedCount: 1 });

    const expectedFilter = { one: 2 };
    const result = await coll.deleteOne(expectedFilter);
    expect(1).toEqual(result.deletedCount);

    const [funcNameArg, funcArgsArg, resultClassArg]: any[] = capture(
      serviceMock.callFunctionInternal
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
      serviceMock.callFunctionInternal(anything(), anything(), anything())
    ).thenReject(new Error("whoops"));

    try {
      await coll.deleteOne({});
      fail();
    } catch (_) {}
  });

  it("should delete many", async () => {
    const serviceMock = mock(CoreStitchServiceClientImpl);
    const service = instance(serviceMock);

    const client = new CoreRemoteMongoClientImpl(service);
    const coll = getCollection(undefined, client);

    when(
      serviceMock.callFunctionInternal(anything(), anything(), anything())
    ).thenResolve({ deletedCount: 1 });

    const expectedFilter = { one: 2 };
    const result = await coll.deleteMany(expectedFilter);
    expect(1).toEqual(result.deletedCount);

    const [funcNameArg, funcArgsArg, resultClassArg]: any[] = capture(
      serviceMock.callFunctionInternal
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
      serviceMock.callFunctionInternal(anything(), anything(), anything())
    ).thenReject(new Error("whoops"));
    try {
      await coll.deleteMany({});
      fail();
    } catch (_) {}
  });

  it("should update one", async () => {
    const serviceMock = mock(CoreStitchServiceClientImpl);
    const service = instance(serviceMock);
    const client = new CoreRemoteMongoClientImpl(service);
    const coll = getCollection(undefined, client);

    const id = new ObjectID();

    when(
      serviceMock.callFunctionInternal(anything(), anything(), anything())
    ).thenResolve({ matchedCount: 1, upsertedId: id.toHexString() });

    const expectedFilter = { one: 2 };
    const expectedUpdate = { three: 4 };
    let result = await coll.updateOne(expectedFilter, expectedUpdate);
    expect(1).toEqual(result.matchedCount);
    expect(id.toHexString()).toEqual(result.upsertedId);

    const [funcNameArg, funcArgsArg, resultClassArg]: any[] = capture(
      serviceMock.callFunctionInternal
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
    expect(id.toHexString()).toEqual(result.upsertedId);

    verify(
      serviceMock.callFunctionInternal(anything(), anything(), anything())
    ).times(2);

    const [funcNameArg2, funcArgsArg2, resultClassArg2]: any[] = capture(
      serviceMock.callFunctionInternal
    ).last();

    expect("updateOne").toEqual(funcNameArg2);
    expect(1).toEqual(funcArgsArg2.length);
    expectedArgs["upsert"] = true;
    expect(expectedArgs).toEqual(funcArgsArg2[0]);
    expect(ResultDecoders.remoteUpdateResultDecoder).toEqual(resultClassArg2);

    // Should pass along errors
    when(
      serviceMock.callFunctionInternal(anything(), anything(), anything())
    ).thenReject(new Error("whoops"));
    try {
      await coll.updateOne({}, {});
      fail();
    } catch (_) {}
  });

  it("should update many", async () => {
    const serviceMock = mock(CoreStitchServiceClientImpl);
    const service = instance(serviceMock);
    const client = new CoreRemoteMongoClientImpl(service);
    const coll = getCollection(undefined, client);

    const id = new ObjectID();

    when(
      serviceMock.callFunctionInternal(anything(), anything(), anything())
    ).thenResolve({ matchedCount: 1, upsertedId: id.toHexString() });

    const expectedFilter = { one: 2 };
    const expectedUpdate = { three: 4 };
    let result = await coll.updateMany(expectedFilter, expectedUpdate);
    expect(1).toEqual(result.matchedCount);
    expect(id.toHexString()).toEqual(result.upsertedId);

    const [funcNameArg, funcArgsArg, resultClassArg]: any[] = capture(
      serviceMock.callFunctionInternal
    ).last();

    expect("updateMany").toEqual(funcNameArg);
    expect(1).toEqual(funcArgsArg.length);
    const expectedArgs = {};
    expectedArgs["database"] = "dbName1";
    expectedArgs["collection"] = "collName1";
    expectedArgs["query"] = expectedFilter;
    expectedArgs["update"] = expectedUpdate;
    expect(expectedArgs).toEqual(funcArgsArg[0]);
    expect(ResultDecoders.remoteUpdateResultDecoder).toEqual(resultClassArg);

    result = await coll.updateMany(expectedFilter, expectedUpdate, {
      upsert: true
    });
    expect(1).toEqual(result.matchedCount);
    expect(id.toHexString()).toEqual(result.upsertedId);

    verify(
      serviceMock.callFunctionInternal(anything(), anything(), anything())
    ).times(2);

    const [funcNameArg2, funcArgsArg2, resultClassArg2]: any[] = capture(
      serviceMock.callFunctionInternal
    ).last();

    expect("updateMany").toEqual(funcNameArg2);
    expect(1).toEqual(funcArgsArg2.length);
    expectedArgs["upsert"] = true;
    expect(expectedArgs).toEqual(funcArgsArg2[0]);
    expect(ResultDecoders.remoteUpdateResultDecoder).toEqual(resultClassArg);

    // Should pass along errors
    when(
      serviceMock.callFunctionInternal(anything(), anything(), anything())
    ).thenReject(new Error("whoops"));
    try {
      await coll.updateMany({}, {});
      fail();
    } catch (_) {}
  });
});
