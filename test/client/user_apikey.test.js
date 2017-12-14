/* global expect, it, describe, global, afterEach, beforeEach, afterAll, beforeAll, require, Buffer, Promise */
import { buildClientTestHarness, extractTestFixtureDataPoints } from '../testutil';

const StitchMongoFixture = require('../fixtures/stitch_mongo_fixture');
const SERVICE_TYPE = 'mongodb';
const SERVICE_NAME = 'mdb';
const TEST_DB = 'test_db';
const TEST_COLLECTION = 'test_collection';


describe('Client API executing user api crud functions', () => {
  let test = new StitchMongoFixture();
  let th;

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

    test.mongo.db(TEST_DB).collection(TEST_COLLECTION);
    th.stitchClient.service(SERVICE_TYPE, SERVICE_NAME)
      .db(TEST_DB)
      .collection(TEST_COLLECTION);
  });

  afterEach(async() => {
    await th.cleanup();
    await test.mongo.db(TEST_DB).dropDatabase();
  });

  it('can get an empty user api key array', async() => {
    return th.stitchClient.getApiKeys()
      .then(response => {
        expect(response).toEqual([]);
      });
  });

  it('can insert an user api key', async() => {
    return th.stitchClient.createApiKey({'name': 'userKey1'})
      .then(response => {
        expect(response.name).toEqual('userKey1');
        expect(response.disabled).toEqual(false);
      });
  });

  it('can delete an user api key', async() => {
    let apiID;
    return th.stitchClient.createApiKey({'name': 'userKey1'})
      .then(response => {
        expect(response.name).toEqual('userKey1');
        apiID = response._id;
      })
      .then(() => {
        return th.stitchClient.deleteApiKeyByID(apiID).then(response => {
          expect(response.status).toEqual(204);

          return th.stitchClient.getApiKeys()
            .then(res => {
              expect(res).toEqual([]);
            });
        });
      });
  });

  it('can get the user api key array with element inserted', async() => {
    return th.stitchClient.createApiKey({'name': 'userKey1'})
      .then(response => {
        expect(response.name).toEqual('userKey1');
      })
      .then(() => {
        return th.stitchClient.getApiKeys().then(response => {
          expect(response.length).toEqual(1);
        });
      });
  });

  it('can get the user api key by id with element inserted', async() => {
    let apiID;
    return th.stitchClient.createApiKey({'name': 'userKey1'})
      .then(response => {
        expect(response.name).toEqual('userKey1');
        apiID = response._id;
      })
      .then(() => {
        return th.stitchClient.getApiKeyByID(apiID).then(response => {
          expect(response._id).toEqual(apiID);
          expect(response.name).toEqual('userKey1');
        });
      });
  });

  it('can enable an user api key', async() => {
    let apiID;
    return th.stitchClient.createApiKey({'name': 'userKey1'})
      .then(response => {
        expect(response.name).toEqual('userKey1');
        apiID = response._id;
      })
      .then(() => {
        return th.stitchClient.enableApiKeyByID(apiID)
          .then(response => {
            expect(response.status).toEqual(204);
          });
      });
  });

  it('can disable an user api key', async() => {
    let apiID;
    return th.stitchClient.createApiKey({'name': 'userKey1'})
      .then(response => {
        expect(response.name).toEqual('userKey1');
        apiID = response._id;
      })
      .then(() => {
        return th.stitchClient.disableApiKeyByID(apiID)
          .then(response => {
            expect(response).toEqual(204);
          });
      });
  });

  // Test invalid key lookups
  it('will return a 404 when we try get an invalid key', async() => {
    return th.stitchClient.getApiKeyByID(1)
      .catch(e => {
        expect(e).toBeInstanceOf(Error);
        expect(e.response.status).toBe(404);
      });
  });

  it('will return a 404 when we try deleting an invalid key', async() => {
    return th.stitchClient.deleteApiKeyByID(1)
      .catch(e => {
        expect(e).toBeInstanceOf(Error);
        expect(e.response.status).toBe(404);
      });
  });

  it('will return a 404 when we try enabling an invalid key', async() => {
    return th.stitchClient.enableApiKeyByID(1)
      .catch(e => {
        expect(e).toBeInstanceOf(Error);
        expect(e.response.status).toBe(404);
      });
  });

  it('will return a 404 when we try disabling an invalid key', async() => {
    return th.stitchClient.disableApiKeyByID(1)
      .catch(e => {
        expect(e).toBeInstanceOf(Error);
        expect(e.response.status).toBe(404);
      });
  });
});
