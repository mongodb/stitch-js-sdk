const StitchMongoFixture = require('../fixtures/stitch_mongo_fixture');
import { buildClientTestHarness, extractTestFixtureDataPoints } from '../testutil';
import { BSON } from 'mongodb-extjson';

const SERVICE_TYPE = 'mongodb';
const SERVICE_NAME = 'mdb';
const TEST_DB = new BSON.ObjectId().toString();
const TEST_COLLECTION = new BSON.ObjectId().toString();

describe('Client API executing mongodb service functions', () => {
  let test = new StitchMongoFixture();
  let th;
  let db;
  let service;

  beforeAll(() => test.setup());
  afterAll(() => test.teardown());

  beforeEach(async() => {
    const { apiKey, groupId, serverUrl } = extractTestFixtureDataPoints(test);
    th = await buildClientTestHarness(apiKey, groupId, serverUrl);

    const mongodbService = await th.app().services().create({
      type: SERVICE_TYPE,
      name: SERVICE_NAME,
      config: {
        uri: 'mongodb://localhost:26000'
      }
    });

    await th.app().services().service(mongodbService._id).rules().create({
      name: 'testRule',
      namespace: `${TEST_DB}.${TEST_COLLECTION}`,
      read: {'%%true': true},
      write: {'%%true': true},
      valid: {'%%true': true},
      fields: {_id: {}, a: {}, b: {}, c: {}, d: {} }
    });

    db = test.mongo.db(TEST_DB).collection(TEST_COLLECTION);
    service = th.stitchClient.service(SERVICE_TYPE, SERVICE_NAME)
      .db(TEST_DB)
      .collection(TEST_COLLECTION);
  });

  afterEach(async() => {
    await th.cleanup();
    await test.mongo.db(TEST_DB).dropDatabase();
  });

  it('Should be successful for insertOne', async() => {
    const testDoc = { a: 1, b: 2, c: 3 };

    const { insertedId } = await service.insertOne(testDoc);
    expect(insertedId).toBeDefined();

    await assertDbMatchesOneById(insertedId, testDoc);
  });

  it('Should be successful for insertMany (provided a single document)', async() => {
    const testDoc = { a: 1, b: 2, c: 3 };

    const { insertedIds } = await service.insertMany(testDoc);
    expect(insertedIds).toHaveLength(1);

    await assertDbMatchesOneById(insertedIds[0], testDoc);
  });

  it('Should be successful for insertMany (provided an array of documents)', async() => {
    const testDocs = [{ a: 1 }, { b: 2 }, { c: 3 }];

    const { insertedIds } = await service.insertMany(testDocs);
    expect(insertedIds).toHaveLength(3);

    await assertDbMatchesMany(insertedIds, testDocs);
  });

  it('Should be successful for deleteOne', async() => {
    const { insertedId } = await service.insertOne({ a: 1, b: 2, c: 3 });

    const { deletedCount } = await service.deleteOne({ _id: insertedId });
    expect(deletedCount).toBe(1);

    await assertDbHasNoneById(insertedId);
  });

  it('Should be successful for deleteMany', async() => {
    const { insertedIds } = await service.insertMany([{ a: 1 }, { b: 2 }, { c: 3 }]);

    const { deletedCount } = await service.deleteMany({ _id: { $in: insertedIds } });
    expect(deletedCount).toBe(3);

    insertedIds.forEach(await assertDbHasNoneById);
  });

  it('Should be successful for updateOne', async() => {
    const testDoc = { a: 1, b: 2, c: 3 };
    const patchDoc = { d: 4 };

    const { insertedId } = await service.insertOne(testDoc);

    const { matchedCount, upsertedId } = await service.updateOne({ _id: insertedId }, { $set: patchDoc });
    expect(matchedCount).toBe(1);
    expect(upsertedId).toBeFalsy();

    await assertDbMatchesOneById(insertedId, Object.assign(testDoc, patchDoc));
  });

  it('Should be successful for upsert', async() => {
    const query = { a: 1 };
    const testDoc = { a: 1, b: 2, c: 3 };
    const patchDoc = { d: 4 };

    await assertDbHasNone(query);

    let { matchedCount, upsertedId } = await service.updateOne(query, testDoc, { upsert: true });
    expect(matchedCount).toBe(0);
    expect(upsertedId).toBeDefined();

    const testDocId = upsertedId;
    await assertDbMatchesOneById(testDocId, testDoc);

    ({ matchedCount, upsertedId } = await service.updateOne(query, { $set: patchDoc }, { upsert: true }));
    expect(matchedCount).toBe(1);
    expect(upsertedId).toBeFalsy();

    await assertDbMatchesOneById(testDocId, Object.assign(testDoc, patchDoc));
  });

  it('Should be successful for updateMany', async() => {
    const testDocs = [{ a: 1 }, { b: 2 }, { c: 3 }];
    const patchDoc = { d: 4 };

    const { insertedIds } = await service.insertMany(testDocs);

    const { matchedCount, upsertedId } = await service.updateMany({ _id: { $in: insertedIds } }, { $set: patchDoc } );
    expect(matchedCount).toBe(3);
    expect(upsertedId).toBeFalsy();

    await assertDbMatchesMany(insertedIds, testDocs.map(doc => Object.assign(doc, patchDoc)));
  });

  it('Should be successful for find (basic)', async() => {
    const testDocs = [
      { a: 1, b: 'bee', c: 'braves', d: 0 },
      { a: 2, b: 'bee', c: 'patriots', d: 0 },
      { a: 3, b: 'bee', c: 'chipper', d: 0 },
      { a: 4, b: 'be', c: 'tom', d: 0 }
    ];

    await service.insertMany(testDocs);

    const foundDocs = await service.find({ b: 'be' }).limit(1000).execute();

    expect(foundDocs).toHaveLength(1);
    expect(foundDocs[0]).toMatchObject(testDocs[3]);
  });

  it('Should be successful for find (project)', async() => {
    const testDocs = [
      { a: 1, b: 'bee', c: 'braves', d: 0 },
      { a: 2, b: 'bee', c: 'patriots', d: 0 },
      { a: 3, b: 'bee', c: 'chipper', d: 0 },
      { a: 4, b: 'be', c: 'tom', d: 0 }
    ];

    await service.insertMany(testDocs);

    const foundDocs = await service.find({ d: 0 }, { c: 1 }).limit(10000).execute();

    expect(foundDocs).toHaveLength(4);
    expect(foundDocs).toMatchObject([{ c: 'braves' }, { c: 'patriots' }, { c: 'chipper' }, { c: 'tom' }]);
  });

  it('Should be successful for find (limit)', async() => {
    const testDocs = [
      { a: 1, b: 'bee', c: 'braves', d: 0 },
      { a: 2, b: 'bee', c: 'patriots', d: 0 },
      { a: 3, b: 'bee', c: 'chipper', d: 0 },
      { a: 4, b: 'be', c: 'tom', d: 0 }
    ];

    await service.insertMany(testDocs);

    const foundDocs = await service.find({ b: 'bee' }).limit(2).execute();

    expect(foundDocs).toHaveLength(2);
    expect(foundDocs).toMatchObject(testDocs.splice(0, 2));
  });

  it('Should be successful for find (sort)', async() => {
    const testDocs = [
      { a: 1, b: 'bee', c: 'braves', d: 0 },
      { a: 2, b: 'bee', c: 'patriots', d: 0 },
      { a: 3, b: 'bee', c: 'chipper', d: 0 },
      { a: 4, b: 'be', c: 'tom', d: 0 }
    ];

    await service.insertMany(testDocs);

    const foundDocs = await service.find({ d: 0 })
      .sort({ a: -1 }).limit(1000).execute();

    expect(foundDocs).toHaveLength(4);
    expect(foundDocs).toMatchObject(testDocs.reverse());
  });

  it('Should be successful for find (complete)', async() => {
    const testDocs = [
      { a: 1, b: 'bee', c: 'braves', d: 0 },
      { a: 2, b: 'bee', c: 'patriots', d: 0 },
      { a: 3, b: 'bee', c: 'chipper', d: 0 },
      { a: 4, b: 'be', c: 'tom', d: 0 }
    ];

    await service.insertMany(testDocs);

    const foundDocs = await service.find({ b: 'bee' }, { a: 1 })
      .limit(1)
      .sort({ a: -1 })
      .execute();

    expect(foundDocs).toHaveLength(1);
    expect(foundDocs[0]).toMatchObject({ a: 3 });
  });

  it('Should be successful for findOne', async() => {
    const testDocs = [
      { a: 1, b: 'bee', c: 'braves', d: 0 },
      { a: 2, b: 'bee', c: 'patriots', d: 0 },
      { a: 3, b: 'bee', c: 'chipper', d: 0 },
      { a: 4, b: 'be', c: 'tom', d: 0 }
    ];

    await service.insertMany(testDocs);

    const foundDoc = await service.findOne({ b: 'bee' });

    expect(foundDoc).toMatchObject(testDocs[0]);
  });

  it('Should be successful for findOne (does not match any documents)', async() => {
    const testDocs = [
      { a: 1, b: 'bee', c: 'braves', d: 0 },
      { a: 2, b: 'bee', c: 'patriots', d: 0 },
      { a: 3, b: 'bee', c: 'chipper', d: 0 },
      { a: 4, b: 'be', c: 'tom', d: 0 }
    ];

    await service.insertMany(testDocs);

    const foundDoc = await service.findOne({ b: 'cat' });

    expect(foundDoc).toBeNull();
  });

  it('Should be successful for findOne (project)', async() => {
    const testDocs = [
      { a: 1, b: 'bee', c: 'braves', d: 0 },
      { a: 2, b: 'bee', c: 'patriots', d: 0 },
      { a: 3, b: 'bee', c: 'chipper', d: 0 },
      { a: 4, b: 'be', c: 'tom', d: 0 }
    ];

    await service.insertMany(testDocs);

    const foundDoc = await service.findOne({ d: 0 }, { c: 1 });

    expect(foundDoc).toMatchObject({ c: 'braves' });
  });

  it('Should be successful for find (project)', async() => {
    const testDocs = [
      { a: 1, b: 'bee', c: 'braves', d: 0 },
      { a: 2, b: 'bee', c: 'patriots', d: 0 },
      { a: 3, b: 'bee', c: 'chipper', d: 0 },
      { a: 4, b: 'be', c: 'tom', d: 0 }
    ];

    await service.insertMany(testDocs);

    const foundDocs = await service.find({ d: 0 }, { c: 1 }).limit(10000).execute();

    expect(foundDocs).toHaveLength(4);
    expect(foundDocs).toMatchObject([{ c: 'braves' }, { c: 'patriots' }, { c: 'chipper' }, { c: 'tom' }]);
  });

  it('Should be successful for aggregate', async() => {
    const testDocs = [{ a: 1, b: 'foo', c: 0 }, { a: 2, b: 'bar', c: 0 }, { a: 3, b: 'foo', c: 0 }];

    await service.insertMany(testDocs);

    const results = await service.aggregate([
      { $match: { c: 0 } },
      { $group: { _id: '$b', total: { $sum: '$a' } } },
      { $limit: 1000 }
    ]);

    expect(results).toMatchObject([
      { _id: 'bar', total: 2 },
      { _id: 'foo', total: 4 }
    ]);
  });

  it('Should be successful for count (no query, no limit)', async() => {
    const testDocs = [{ a: 1, d: 0 }, { b: 2, d: 0 }, { c: 3, d: 0 }];

    await service.insertMany(testDocs);

    const count = await service.count();
    expect(count).toBe(3);
  });

  it('Should be successful for count (with query, no limit)', async() => {
    const testDocs = [{ a: 1, d: 0 }, { b: 2, d: 0 }, { c: 3, d: 0 }];

    await service.insertMany(testDocs);

    const count = await service.count({ a: 1 });
    expect(count).toBe(1);
  });

  it('Should be successful for count (with query, with limit)', async() => {
    const testDocs = [{ a: 1, d: 0 }, { b: 2, d: 0 }, { c: 3, d: 0 }];

    await service.insertMany(testDocs);

    const count = await service.count({ d: 0 }, { limit: 2 });
    expect(count).toBe(2);
  });

  // db assertions

  const assertDbMatchesOneById = async(id, expected) => {
    await assertDbMatchesOne({ _id: id }, expected);
  };

  const assertDbMatchesOne = async(query, expected) => {
    const actual = await db.findOne(query);
    expect(actual).toMatchObject(expected);
  };

  const assertDbHasNoneById = async(id) => {
    await assertDbHasNone({ _id: id });
  };

  const assertDbHasNone = async(query) => {
    const actual = await db.findOne(query);
    expect(actual).toBeNull();
  };

  const assertDbMatchesMany = async(ids, expecteds) => {
    const cursor = db.find({ _id: { $in: ids } });
    const actuals = await cursor.toArray();
    cursor.close();

    expect(actuals).toMatchObject(expecteds);
  };
});
