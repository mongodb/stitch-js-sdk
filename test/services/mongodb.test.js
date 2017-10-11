const StitchMongoFixture = require('../fixtures/stitch_mongo_fixture');
const stitch = require('../../src');

const TEST_DB = 'mongosvctest';
const TESTNS1 = 'documents';
const TESTNS2 = 'documents2';

let stripObjectIds = (data) => data.map(d => { delete d._id; return d; });

async function testSetup(fixture) {
  await fixture.cleanTestNamespaces();
  const newApp = await fixture.admin.v2().apps(fixture.userData.group.groupId).create({name: 'test'});
  const app = fixture.admin.v2().apps(fixture.userData.group.groupId).app(newApp._id);
  await app.authProviders().create({name: 'api-key', type: 'api-key', disabled: false});
  const newKey = await app.apiKeys().create({name: 'test'});
  const client = new stitch.StitchClient(newApp.client_app_id, {baseUrl: fixture.options.baseUrl});
  await client.authenticate('apiKey', newKey.key);
  let testSvc = await app.services().create({name: 'mdb1', type: 'mongodb', config: {uri: 'mongodb://localhost:26000'}});

  let testRuleConfig = {
    read: {'%%true': true},
    write: {'%%true': true},
    valid: {'%%true': true},
    fields: {_id: {}, a: {}, b: {}, c: {} }
  };
  await app.services().service(testSvc._id).rules().create(
    Object.assign({}, testRuleConfig, {name: 'testRule', namespace: `${TEST_DB}.${TESTNS1}`})
  );
  await app.services().service(testSvc._id).rules().create(
    Object.assign({}, testRuleConfig, {name: 'testRule2', namespace: `${TEST_DB}.${TESTNS2}`})
  );
  fixture.registerTestNamespace(TEST_DB, TESTNS1);
  fixture.registerTestNamespace(TEST_DB, TESTNS2);
  return client.service('mongodb', 'mdb1');
}

let test = new StitchMongoFixture;
describe('MongoDBService', function() {
  let testService;
  let db;

  beforeAll(async () => {
    await test.setup();
  });
  afterAll(() => test.teardown());

  beforeEach(async () => {
    testService = await testSetup(test);
    db = testService.db(TEST_DB);
  });

  it('should correctly insert a single document', async function() {
    let response = await db.collection(TESTNS1).insertOne({ a: 1 });
    expect(response.insertedIds).toHaveLength(1);
  });

  it('should correctly insert a many documents', async function() {
    let response = await db.collection(TESTNS1).insertMany([{}, {}, {}]);
    expect(response.insertedIds).toHaveLength(3);
  });

  it('should add oids to docs without them', async function() {
    let request = db.collection(TESTNS1).insertMany([{}, {}, {}]);
    let items = request[0].args.items;
    items.map(item => expect(item).toHaveProperty('_id'));
  });

  it('should update a single document', async function() {
    let response = await db.collection(TESTNS1).insertMany([ { a: 1 }, { a: 1 } ]);
    response = await db.collection(TESTNS1).updateOne({ a: 1 }, { a: 2 });
    let results = stripObjectIds(response.result);
    expect(results).toHaveLength(1);
    expect(results).toEqual([ { a: 2 } ]);

      // TODO: reenable when BAAS-89 is complete
      // expect(response.matchedCount).toEqual(1);
      // expect(response.modifiedCount).toEqual(1);
      // expect(response.upsertedId).toBeNull();
  });

  it('should update multiple documents', async function() {
    let response = await db.collection(TESTNS1).insertMany([ { a: 1 }, { a: 1 } ]);
    response = await db.collection(TESTNS1).updateMany({ a: 1 }, { a: 2 });
    let results = stripObjectIds(response.result);
    expect(results).toHaveLength(2);
    expect(results).toEqual([ { a: 2 }, { a: 2 } ]);

      // TODO: reenable when BAAS-89 is complete
      // expect(response.matchedCount).toEqual(2);
      // expect(response.modifiedCount).toEqual(2);
      // expect(response.upsertedId).toBeNull();
  });

  it('should delete a single document', async function() {
    let response = await db.collection(TESTNS1).insertOne({ a: 1 });
    response = await db.collection(TESTNS1).deleteOne({ _id: response.insertedIds[0] });
    expect(response.deletedCount).toEqual(1);
  });


  it('should delete multiple documents', async function() {
    let response = await db.collection(TESTNS1).insertMany([{ a: 1 }, { a: 1 }, { a: 1 }]);
    response = await db.collection(TESTNS1).deleteMany({ a: 1 });
    expect(response.deletedCount).toEqual(3);
  });

  it('should find documents', async function() {
    await db.collection(TESTNS1).insertOne({ a: 1 });
    let response = await db.collection(TESTNS1).find();
    let results = stripObjectIds(response);
    expect(results).toEqual([ { a: 1 } ]);
  });

  it('should find documents with a query', async function() {
    await db.collection(TESTNS1).insertMany([ { a: 1 }, { b: 1 } ]);
    let response = await db.collection(TESTNS1).find({ a: 1 });
    let results = stripObjectIds(response);
    expect(results).toEqual([ { a: 1 } ]);
  });

  it('should find documents using projection', async function() {
    await db.collection(TESTNS1).insertOne({ a: 'a', b: 'b', c: 'c' });
    let response = await db.collection(TESTNS1).find({}, { projection: { a: 1 }});
    let results = stripObjectIds(response);
    expect(results).toEqual([ { a: 'a' } ]);
  });

  it('executes the pipeline', async function() {
    await db.collection(TESTNS1).insertMany([{ a: 1 }, { a: 2 }]);
    let response = await db.collection(TESTNS1).aggregate([{ '$match': { a: 1 }}]);
    let results = stripObjectIds(response);
    expect(results).toEqual([ { a: 1 } ]);
  });

  it('should count documents', async function() {
    await db.collection(TESTNS1).insertMany([ {}, {}, {}, {}, {} ]);
    let response = await db.collection(TESTNS1).count();
    expect(response).toEqual(5);
  });

  it('should allow for composed database actions', async function() {
    let docs = db.collection(TESTNS1);
    let docs2 = db.collection(TESTNS2);

    let response = await testService.stitchClient.executePipeline([
      docs.insertMany([ {}, {}, {}, {}, {} ]),
      docs2.insertMany()
    ]);

    expect(response.result).toBeInstanceOf(Array);
    expect(response.result).toHaveLength(5);
  });

  describe('warnings', function() {
    beforeEach(async () => {
      jasmine.DEFAULT_TIMEOUT_INTERVAL = 1000 * 30;
    });

    it('should count documents', async function() {
      const numDocs = 20000;
      const stepSize = 1000;
      let testDocs = [...Array(numDocs).keys()].map(x => ({_id: x}));

      for (let i = 0; i < testDocs.length; i += stepSize ) {
        await db.collection(TESTNS1).insertMany(testDocs.slice(i, i + stepSize));
      }

      let response = await db.collection(TESTNS1).find({});
      expect(response.length).toBe(10001);
      expect(response._stitch_metadata.warnings).toEqual(
        ['output array size limit of 10000 exceeded']
      );
    });
  });
});
