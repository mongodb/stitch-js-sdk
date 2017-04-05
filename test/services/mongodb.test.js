const BaasMongoFixture = require('../fixtures/baas_mongo_fixture');
const baas = require('../../src');

let stripObjectIds = (data) => data.map(d => { delete d._id; return d; });
async function testSetup() {
  test.client = new baas.BaasClient(test.clientAppId, { baseUrl: 'http://localhost:7080' });
  await test.client.authManager.apiKeyAuth(test.appKey.key);
  let service = test.client.service('mongodb', 'mdb1');
  test.db = service.db('test');
}

let test = new BaasMongoFixture;
describe('MongoDBService', function() {
  beforeAll(() => test.setup());
  afterAll(() => test.teardown());

  describe('insert', function() {
    beforeEach(() => testSetup());
    afterEach(() => test.cleanDatabase());

    it('should correctly insert a single document', async function() {
      let response = await test.db.collection('documents').insertOne({ a: 1 });
      let results = stripObjectIds(response.result);
      expect(results).toEqual([ { a: 1 } ]);
    });
  });

  describe.skip('update', function() {
    beforeEach(() => testSetup());
    afterEach(() => test.cleanDatabase());

    it('should update a single document', async function() {
      let response = await test.db.collection('documents').insertOne({ a: 1 });
      let results = stripObjectIds(response.result);
      expect(results).toEqual([ { a: 1 } ]);

      response = await test.db.collection('documents')
        .updateOne({ _id: response.result[0]._id }, { a: 2 });
      console.log(response);
    });
  });

  describe('delete', function() {
    beforeEach(() => testSetup());
    afterEach(() => test.cleanDatabase());

    it('should delete a single document', async function() {
      let response = await test.db.collection('documents').insertOne({ a: 1 });
      let results = stripObjectIds(response.result);
      expect(results).toEqual([ { a: 1 } ]);
      response = await test.db.collection('documents').deleteOne({ _id: response.result[0]._id });
      expect(response).toEqual({ result: [ { removed: 1 } ] });
    });
  });

  describe('find', function() {
    beforeEach(() => testSetup());
    afterEach(() => test.cleanDatabase());

    it('should find documents', async function() {
      let response = await test.db.collection('documents').insertOne({ a: 1 });
      let results = stripObjectIds(response.result);
      expect(results).toEqual([ { a: 1 } ]);
      response = await test.db.collection('documents').find(null, null);
      results = stripObjectIds(response.result);
      expect(results).toEqual([ { a: 1 } ]);
    });
  });

  describe('count', function() {
    beforeEach(() => testSetup());
    afterEach(() => test.cleanDatabase());

    it('should count documents', async function() {
      await test.db.collection('documents').insertMany([ {}, {}, {}, {}, {} ]);
      let response = await test.db.collection('documents').count();
      expect(response.result).toEqual([ 5 ]);
    });
  });
});
