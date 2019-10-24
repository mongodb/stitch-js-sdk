const StitchMongoFixture = require('../fixtures/stitch_mongo_fixture');

import { buildClientTestHarness, extractTestFixtureDataPoints } from '../testutil';

const jwtDecode = require('jwt-decode');

function createSampleMongodbService(services) {
  return services.create({
    type: 'mongodb',
    name: 'mdb',
    config: {
      uri: 'mongodb://localhost:26000'
    }
  });
}

describe('Custom User Data', () => {
  let test = new StitchMongoFixture();
  let th;
  let client;
  let customUserData;
  let services;

  beforeAll(() => test.setup());
  afterAll(() => test.teardown());

  beforeEach(async() => {
    const { apiKey, groupId, serverUrl } = extractTestFixtureDataPoints(test);
    th = await buildClientTestHarness(apiKey, groupId, serverUrl);
    await th.configureAnon();
    client = th.stitchClient;
    await client.logout();

    customUserData = th.app().customUserData();
    services = th.app().services();
  });

  afterEach(async() => th.cleanup());

  describe('get', () => {
    let data;

    beforeEach(async() => {
      data = await customUserData.get();
    });

    it('should get the mongo_service_id', () => {
      expect(data.mongo_service_id).toBeDefined();
    });

    it('should get the database_name', () => {
      expect(data.database_name).toBeDefined();
    });

    it('should get the collection_name', () => {
      expect(data.collection_name).toBeDefined();
    });

    it('should get the user_id_field', () => {
      expect(data.user_id_field).toBeDefined();
    });

    it('should get the enabled field', () => {
      expect(data.enabled).toBeDefined();
    });
  });

  describe('update', () => {
    let newData;
    let updatedData;

    beforeEach(async() => {
      const mongodbService = await createSampleMongodbService(services);
      newData = {
        mongo_service_id: mongodbService._id,
        enabled: true,
        database_name: 'booboo',
        collection_name: 'theFool',
        user_id_field: 'vegeta'
      };
      await customUserData.update(newData);
      updatedData = await customUserData.get();
    });

    it('should update the mongo_service_id', () => {
      expect(updatedData.mongo_service_id).toBe(newData.mongo_service_id);
    });

    it('should update the database_name', () => {
      expect(updatedData.database_name).toBe(newData.database_name);
    });

    it('should update the collection_name', () => {
      expect(updatedData.collection_name).toBe(newData.collection_name);
    });

    it('should update the user_id_field', () => {
      expect(updatedData.user_id_field).toBe(newData.user_id_field);
    });

    it('should update the enabled field', () => {
      expect(updatedData.enabled).toBe(newData.enabled);
    });
  });

  describe('when custom user data is in the collection', () => {
    let mongodbService;
    let session;
    let doc;
    const testUserEmail = 'vegeta@10gen.com';
    const testUserPassword = 'darnyoukakarot';

    beforeEach(async() => {
      const dbName = 'booboo';
      const collName = 'theFool';

      // Set up mongodb service
      mongodbService = await createSampleMongodbService(services);
      const monogSvcObj = services.service(mongodbService._id);
      let testRuleConfig = {
        read: {'%%true': true},
        write: {'%%true': true},
        valid: {'%%true': true},
        fields: {_id: {}, a: {}, b: {}, c: {} }
      };
      const db = test.mongo.db(dbName);
      await monogSvcObj.rules().create(
        Object.assign({}, testRuleConfig, { name: 'testRule', namespace: `${dbName}.${collName}` })
      );

      // Create a user
      await client.register(testUserEmail, testUserPassword);

      // Confirm the user and log them in
      let { token_id: tokenId, token } = await th.app().userRegistrations().sendConfirmationEmail(testUserEmail);
      await client.auth.provider('userpass').emailConfirm(tokenId, token);
      await client.login(testUserEmail, testUserPassword);
      const { user_id: userId } = await client.userProfile();

      // Insert some data into the collection
      doc = { 'vegeta': userId, 'goku': 'clown' };
      let insertResponse = await db.collection(collName).insertOne(doc);
      expect(insertResponse.insertedCount).toEqual(1);

      // Update custom user data to check that collection
      const newData = {
        mongo_service_id: mongodbService._id,
        enabled: true,
        database_name: dbName,
        collection_name: collName,
        user_id_field: 'vegeta'
      };
      await customUserData.update(newData);

      session = await client.doSessionPost();
    });

    it('should appear when a user logs in', async() => {
      let decodedToken;
      try {
        decodedToken = jwtDecode(session.access_token);
      } catch (e) {
        console.log(e);
      }
      const { user_data: userData } = decodedToken;
      expect(userData.vegeta).toEqual(doc.vegeta);
      expect(userData.goku).toEqual(doc.goku);
    });
  });
});
