const StitchMongoFixture = require('../fixtures/stitch_mongo_fixture');
const stitch = require('../../src');

let stripObjectIds = (data) => data.map(d => { delete d._id; return d; });
async function testSetup() {
  test.client = new stitch.StitchClient(test.clientAppId, { baseUrl: 'http://localhost:7080' });
  await test.client.authenticate('apiKey', test.appKey.key);
  let service = test.client.service('mongodb', 'mdb1');
  test.db = service.db('test');
}

let test = new StitchMongoFixture;
describe('MongoDBService', function() {
  beforeAll(() => test.setup());
  afterAll(() => test.teardown());

  describe('insert', function() {
    beforeEach(() => testSetup());
    afterEach(() => test.cleanDatabase());

    it('should correctly insert a single document', async function() {
      let response = await test.db.collection('documents').insertOne({ a: 1 });
      expect(response.insertedIds).toHaveLength(1);
    });

    it('should correctly insert a many documents', async function() {
      let response = await test.db.collection('documents').insertMany([{}, {}, {}]);
      expect(response.insertedIds).toHaveLength(3);
    });

    it('should add oids to docs without them', async function() {
      let request = test.db.collection('documents').insertMany([{}, {}, {}]);
      let items = request[0].args.items;
      items.map(item => expect(item).toHaveProperty('_id'));
    });
  });

  describe('update', function() {
    beforeEach(() => testSetup());
    afterEach(() => test.cleanDatabase());

    it('should update a single document', async function() {
      let response = await test.db.collection('documents').insertMany([ { a: 1 }, { a: 1 } ]);
      response = await test.db.collection('documents').updateOne({ a: 1 }, { a: 2 });
      let results = stripObjectIds(response.result);
      expect(results).toHaveLength(1);
      expect(results).toEqual([ { a: 2 } ]);

      // TODO: reenable when BAAS-89 is complete
      // expect(response.matchedCount).toEqual(1);
      // expect(response.modifiedCount).toEqual(1);
      // expect(response.upsertedId).toBeNull();
    });

    it('should update multiple documents', async function() {
      let response = await test.db.collection('documents').insertMany([ { a: 1 }, { a: 1 } ]);
      response = await test.db.collection('documents').updateMany({ a: 1 }, { a: 2 });
      let results = stripObjectIds(response.result);
      expect(results).toHaveLength(2);
      expect(results).toEqual([ { a: 2 }, { a: 2 } ]);

      // TODO: reenable when BAAS-89 is complete
      // expect(response.matchedCount).toEqual(2);
      // expect(response.modifiedCount).toEqual(2);
      // expect(response.upsertedId).toBeNull();
    });
  });

  describe('delete', function() {
    beforeEach(() => testSetup());
    afterEach(() => test.cleanDatabase());

    it('should delete a single document', async function() {
      let response = await test.db.collection('documents').insertOne({ a: 1 });
      response = await test.db.collection('documents').deleteOne({ _id: response.insertedIds[0] });
      expect(response.deletedCount).toEqual(1);
    });


    it('should delete multiple documents', async function() {
      let response = await test.db.collection('documents').insertMany([{ a: 1 }, { a: 1 }, { a: 1 }]);
      response = await test.db.collection('documents').deleteMany({ a: 1 });
      expect(response.deletedCount).toEqual(3);
    });
  });

  describe('find', function() {
    beforeEach(() => testSetup());
    afterEach(() => test.cleanDatabase());

    it('should find documents', async function() {
      await test.db.collection('documents').insertOne({ a: 1 });
      let response = await test.db.collection('documents').find();
      let results = stripObjectIds(response);
      expect(results).toEqual([ { a: 1 } ]);
    });

    it('should find documents with a query', async function() {
      await test.db.collection('documents').insertMany([ { a: 1 }, { b: 1 } ]);
      let response = await test.db.collection('documents').find({ a: 1 });
      let results = stripObjectIds(response);
      expect(results).toEqual([ { a: 1 } ]);
    });

    it('should find documents using projection', async function() {
      await test.db.collection('documents').insertOne({ a: 'a', b: 'b', c: 'c' });
      let response = await test.db.collection('documents').find({}, { projection: { a: 1 }});
      let results = stripObjectIds(response);
      expect(results).toEqual([ { a: 'a' } ]);
    });
  });

  describe('count', function() {
    beforeEach(() => testSetup());
    afterEach(() => test.cleanDatabase());

    it('should count documents', async function() {
      await test.db.collection('documents').insertMany([ {}, {}, {}, {}, {} ]);
      let response = await test.db.collection('documents').count();
      expect(response).toEqual(5);
    });
  });

  describe('pipelines', function() {
    beforeEach(() => testSetup());
    afterEach(() => test.cleanDatabase());

    it('should allow for composed database actions', async function() {
      let docs = test.db.collection('documents');
      let docs2 = test.db.collection('documents2');

      let response = await test.client.executePipeline([
        docs.insertMany([ {}, {}, {}, {}, {} ]),
        docs2.insertMany()
      ]);

      expect(response.result).toBeInstanceOf(Array);
      expect(response.result).toHaveLength(5);
    });
  });
});
