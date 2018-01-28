/* global expect, it, describe, global, afterEach, beforeEach, afterAll, beforeAll, require, Buffer, Promise */
import { buildClientTestHarness, extractTestFixtureDataPoints } from '../testutil';
import { BSON } from 'mongodb-extjson';

const StitchMongoFixture = require('../fixtures/stitch_mongo_fixture');
const SERVICE_TYPE = 'mongodb';
const SERVICE_NAME = 'mdb';
const TEST_DB = new BSON.ObjectId().toString();
const TEST_COLLECTION = new BSON.ObjectId().toString();

describe('Client API executing user api crud functions', () => {
  let test = new StitchMongoFixture();
  let th;

  beforeAll(() => test.setup());
  afterAll(() => test.teardown());

  beforeEach(async() => {
    const { apiKey, groupId, serverUrl } = extractTestFixtureDataPoints(test);
    th = await buildClientTestHarness(apiKey, groupId, serverUrl);

    // enable api key auth provider
    let providers = await th.app().authProviders().list();
    await th.app().authProviders().authProvider(providers[0]._id).enable();
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

  it('can get an empty user api key array.', async() => {
    return th.stitchClient.getApiKeys()
      .then(response => {
        expect(response).toEqual([]);
      })
      .catch(e => {
        fail('Should be able to obtain empty user api key array.');
      });
  });

  it('can insert a user api key.', async() => {
    return th.stitchClient.createApiKey('userKey1')
      .then(response => {
        assertApiKey(response, 'userKey1', response._id, false);
      })
      .catch(e => {
        fail('Should be able to insert a user api key.');
      });
  });

  it('can delete a user api key.', async() => {
    let apiID;
    return th.stitchClient.createApiKey('userKey1')
      .then(response => {
        apiID = response._id;
        assertApiKey(response, 'userKey1', apiID, false);
      })
      .catch(e => {
        fail('Should be able to insert a user api key.');
      })
      .then(() => {
        return th.stitchClient.deleteApiKeyByID(apiID);
      })
      .then(response => {
        expect(response.status).toEqual(204);
        return th.stitchClient.getApiKeys();
      })
      .then(res => {
        expect(res).toEqual([]);
      })
      .catch(e => {
        fail('Should be able to obtain a user api key.');
      });
  });

  it('can get the user api key array with element inserted.', async() => {
    return th.stitchClient.createApiKey('userKey1')
      .then(response => {
        assertApiKey(response, 'userKey1', response._id, false);
      })
      .catch(e => {
        fail('Should be able to insert a user api key.');
      })
      .then(() => {
        return th.stitchClient.getApiKeys();
      })
      .then(response => {
        expect(response.length).toEqual(1);
      })
      .catch(e => {
        fail('Should be able to obtain user api keys and have the length be equal to 1.');
      });
  });

  it('can get the user api key by id with element inserted.', async() => {
    let apiID;
    let userKeyName = 'userKey1';
    return th.stitchClient.createApiKey(userKeyName)
      .then(response => {
        assertApiKey(response, userKeyName, response._id, false);
        apiID = response._id;
      })
      .then(() => {
        return th.stitchClient.getApiKeyByID(apiID);
      })
      .then(response => {
        assertApiKey(response, userKeyName, response._id, false);
      }).catch(e => {
        fail('Should be able to obtain user api keys and assert the contents be equal to what was passed in.');
      });
  });

  it('can disable and enable a user api key.', async() => {
    let userKeyName = 'userKey1';
    let apiID;
    await th.stitchClient.createApiKey(userKeyName).then(async(response) => {
      assertApiKey(response, userKeyName, response._id, false);
      apiID = response._id;
    })
      .then(async() => {
        const p2 = await th.stitchClient.disableApiKeyByID(apiID);
        return p2;
      })
      .then(async(res) => {
        expect(res.status).toEqual(204);
        const p3 = await th.stitchClient.getApiKeyByID(apiID);
        return p3;
      })
      .then(async(res2) => {
        assertApiKey(res2, userKeyName, res2._id, true);
        const p4 = await th.stitchClient.enableApiKeyByID(apiID);
        return p4;
      })
      .then(async(res3) => {
        expect(res3.status).toEqual(204);
        const p5 = await th.stitchClient.getApiKeyByID(apiID);
        return p5;
      })
      .then(async(res4) => {
        assertApiKey(res4, userKeyName, res4._id, false);
      });
  });

  // Test invalid key lookups
  it('will return a 404 when we try get an invalid user api key.', async() => {
    return th.stitchClient.getApiKeyByID(1)
      .then(res => {
        fail('Should not be able to successfully obtain an invalid user api key.');
      })
      .catch(e => {
        assertError(e, 404);
      });
  });

  it('will return a 404 when we try deleting an invalid user api key.', async() => {
    return th.stitchClient.deleteApiKeyByID(1)
      .then(res => {
        fail('Should not be able to successfully delete an invalid user api key.');
      })
      .catch(e => {
        assertError(e, 404);
      });
  });

  it('will return a 404 when we try enabling an invalid user api key.', async() => {
    return th.stitchClient.enableApiKeyByID(1)
      .then(res => {
        fail('Should not be able to successfully enable an invalid user api key.');
      })
      .catch(e => {
        assertError(e, 404);
      });
  });

  it('will return a 404 when we try disabling an invalid user api key.', async() => {
    return th.stitchClient.disableApiKeyByID(1)
      .then(res => {
        fail('Should not be able to successfully disable an invalid user api key.');
      })
      .catch(e => {
        assertError(e, 404);
      });
  });

  const assertError = (e, eStatus, eCode) => {
    expect(e).toBeInstanceOf(Error);
    expect(e.response.status).toBe(eStatus);
    if (eCode) {
      expect(e.code).toBe(eCode);
    }
  };

  const assertApiKey = (key, name, id, disabled) => {
    expect(key._id).toEqual(id);
    expect(key.name).toEqual(name);
    expect(key.disabled).toEqual(disabled);
  };
});
