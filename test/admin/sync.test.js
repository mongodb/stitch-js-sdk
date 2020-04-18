const StitchMongoFixture = require('../fixtures/stitch_mongo_fixture');

import {
  buildAdminTestHarness,
  extractTestFixtureDataPoints,
  createSampleMongodbService,
  createSampleMongodbSyncService,
  addRuleToMongodbService
} from '../testutil';

describe('Sync', () => {
  let test = new StitchMongoFixture();
  let th;
  let sync;
  let syncConfig;
  let syncClientSchemas;
  let services;

  beforeAll(() => test.setup());
  afterAll(() => test.teardown());

  beforeEach(async() => {
    const { apiKey, groupId, serverUrl } = extractTestFixtureDataPoints(test);
    th = await buildAdminTestHarness(true, apiKey, groupId, serverUrl);
    sync = th.app().sync();
    syncConfig = sync.config();
    syncClientSchemas = sync.clientSchemas();
    services = th.app().services();
  });

  afterEach(async() => th.cleanup());

  describe('config', () => {
    it('exposes a .get() which returns the config settings', async() => {
      const config = await syncConfig.get();
      expect(config).toEqual({
        development_mode_enabled: false
      });
    });

    it('exposes an .update() which sets the config settings', async() => {
      const newConfig = {
        development_mode_enabled: true
      };

      await syncConfig.update(newConfig);
      const updatedConfig = await syncConfig.get();
      expect(updatedConfig).toEqual(newConfig);
    });
  });

  describe('clientSchemas', () => {
    describe('.get()', async() => {
      it('should return a 400 error if called with an unsupported language', async() => {
        try {
          await syncClientSchemas.get('PERL');
        } catch (e) {
          expect(e.response.status).toEqual(400);
          expect(e.message).toEqual("Unsupported client language: 'PERL'");
        }
      });

      it('should return a 500 error if called when no MongoDB service exists', async() => {
        try {
          await syncClientSchemas.get('KOTLIN');
        } catch (e) {
          expect(e.response.status).toEqual(500);
          expect(e.message).toEqual('error processing request');
        }
      });

      it('should return an error if called when the app has no MongoDB service rules', async() => {
        // Setup MongoDB service
        await createSampleMongodbService(services);

        try {
          await syncClientSchemas.get('KOTLIN');
        } catch (e) {
          expect(e.response.status).toEqual(500);
          expect(e.message).toEqual('error processing request');
        }
      });

      it('should succed with a supported language and and rules', async() => {
        // Setup MongoDB service
        const mongoDBService = await createSampleMongodbService(services);
        await addRuleToMongodbService(services, mongoDBService, { database: 'foo', collection: 'bar' });
        const schemas = await syncClientSchemas.get('KOTLIN');
        expect(schemas.length).toEqual(1);
      });
    });
  });

  describe('data', () => {
    it('should return nothing if called when the app has no MongoDB sync service', async() => {
      const data = await sync.data();
      expect(data).toEqual({});
    });

    it('should return partition fields if called with a service_id param', async() => {
      const svc = await createSampleMongodbService(services);
      await addRuleToMongodbService(services, svc, {
        database: 'db',
        collection: 'coll1',
        config: {
          schema: {
            properties: {
              _id: { bsonType: 'objectId' },
              email: { bsonType: 'string' },
              active: { bsonType: 'boolean' },
              store_id: { bsonType: 'objectId' },
              created_at: { bsonType: 'long' }
            }
          }
        }
      });
      await addRuleToMongodbService(services, svc, {
        database: 'db',
        collection: 'coll2',
        config: {
          schema: {
            properties: {
              _id: { bsonType: 'objectId' },
              email: { bsonType: 'string' },
              active: { bsonType: 'boolean' },
              store_id: { bsonType: 'objectId' },
              created_at: { bsonType: 'long' }
            }
          }
        }
      });

      const data = await sync.data({ service_id: svc._id });
      expect(data).toEqual({ partition_fields: ['created_at', 'email', 'store_id'] });
    });

    it('should return correct data for an enabled sync service', async() => {
      const syncService = await createSampleMongodbSyncService(services, 'email');
      await addRuleToMongodbService(services, syncService, {
        database: 'db',
        collection: 'coll',
        config: {
          schema: {
            properties: {
              _id: { bsonType: 'objectId' },
              email: { bsonType: 'string' },
              active: { bsonType: 'boolean' },
              store_id: { bsonType: 'objectId' },
              created_at: { bsonType: 'long' }
            }
          }
        }
      });

      const data = await sync.data();
      expect(data).toEqual({ service_id: syncService._id, partition_fields: ['created_at', 'email', 'store_id'] });
    });
  });

  describe('patch schemas', () => {
    it('should succeed with updating service collection schemas', async() => {
      const svc = await createSampleMongodbService(services);
      await addRuleToMongodbService(services, svc, {
        database: 'db',
        collection: 'coll1',
        config: {
          schema: {
            properties: {
              _id: { bsonType: 'objectId' }
            }
          }
        }
      });

      await sync.patchSchemas({
        service_id: svc._id,
        partition_key: 'key',
        partition_key_type: 'string'
      });

      const rules = await services.service(svc._id).rules().list();
      expect(rules).toHaveLength(1);

      const rule = await services.service(svc._id).rules().rule(rules[0]._id).get();
      expect(rule.schema).toEqual({
        properties: {
          _id: { bsonType: 'objectId' },
          key: { bsonType: 'string' }
        }
      });
    });
  });
});
