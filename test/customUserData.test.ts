import CustomUserDataConfig from '../src/api/v3/CustomUserData';

import RealmMongoFixture from './fixtures/realm_mongo_fixture';
import {
  addRuleToMongodbService,
  buildClientTestHarness,
  createSampleMongodbService,
  extractTestFixtureDataPoints,
} from './testutil';

import jwtDecode from 'jwt-decode';

describe('Custom User Data', () => {
  const test = new RealmMongoFixture();
  let th;
  let client;
  let customUserData;
  let services;

  beforeAll(() => test.setup());
  afterAll(() => test.teardown());

  beforeEach(async () => {
    const { apiKey, groupId, serverUrl } = extractTestFixtureDataPoints(test);
    th = await buildClientTestHarness(apiKey, groupId, serverUrl);
    await th.configureAnon();
    client = th.realmClient;
    await client.logout();

    customUserData = th.app().customUserData();
    services = th.app().services();
  });

  afterEach(async () => th.cleanup());

  describe('get', () => {
    let data;

    beforeEach(async () => {
      data = await customUserData.get();
    });

    it('should get the mongo service id', () => {
      expect(data.mongoServiceId).toBeDefined();
    });

    it('should get the database name', () => {
      expect(data.databaseName).toBeDefined();
    });

    it('should get the collection name', () => {
      expect(data.collectionName).toBeDefined();
    });

    it('should get the user id field', () => {
      expect(data.userIdField).toBeDefined();
    });

    it('should get the enabled field', () => {
      expect(data.enabled).toBeDefined();
    });
  });

  describe('update', () => {
    let newData;
    let updatedData;

    beforeEach(async () => {
      const mongodbService = await createSampleMongodbService(services);
      newData = new CustomUserDataConfig({
        mongoServiceId: mongodbService.id,
        enabled: true,
        databaseName: 'booboo',
        collectionName: 'theFool',
        userIdField: 'vegeta',
      });
      await customUserData.update(newData);
      updatedData = await customUserData.get();
    });

    it('should update the mongo service id', () => {
      expect(updatedData.mongoServiceId).toBe(newData.mongoServiceId);
    });

    it('should update the database name', () => {
      expect(updatedData.databaseName).toBe(newData.databaseName);
    });

    it('should update the collection name', () => {
      expect(updatedData.collectionName).toBe(newData.collectionName);
    });

    it('should update the user id field', () => {
      expect(updatedData.userIdField).toBe(newData.userIdField);
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

    beforeEach(async () => {
      const dbName = 'booboo';
      const collName = 'theFool';

      // Set up mongodb service
      mongodbService = await createSampleMongodbService(services);
      await addRuleToMongodbService(services, mongodbService, {
        database: dbName,
        collection: collName,
      });

      // Create a user
      await client.register(testUserEmail, testUserPassword);

      // Confirm the user and log them in
      const { tokenId, token } = await th.app().userRegistrations().sendConfirmationEmail(testUserEmail);
      await client.auth.provider('userpass').emailConfirm(tokenId, token);
      await client.login(testUserEmail, testUserPassword);
      const { user_id: userId } = await client.userProfile();

      // Insert some data into the collection
      const db = test.mongo.db(dbName);
      doc = { vegeta: userId, goku: 'clown' };
      const insertResponse = await db.collection(collName).insertOne(doc);
      expect(insertResponse.insertedCount).toEqual(1);

      // Update custom user data to check that collection
      const newData = new CustomUserDataConfig({
        mongoServiceId: mongodbService.id,
        enabled: true,
        databaseName: dbName,
        collectionName: collName,
        userIdField: 'vegeta',
      });
      await customUserData.update(newData);

      session = await client.doSessionPost();
    });

    it('should appear when a user logs in', async () => {
      const decodedToken: any = jwtDecode(session.access_token);
      const { user_data: userData } = decodedToken;
      expect(userData.vegeta).toEqual(doc.vegeta);
      expect(userData.goku).toEqual(doc.goku);
    });
  });
});
