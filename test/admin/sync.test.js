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

  describe('destructive changes', () => {
    it('can use the allow_destructive_changes param to do a destructive deploy', async() => {
      const syncService = await createSampleMongodbSyncService(services);
      const createdRule = await addRuleToMongodbService(services, syncService, {
        database: 'db',
        collection: 'coll',
        config: {
          schema: {
            properties: {
              _id: { bsonType: 'objectId' },
              key: { bsonType: 'string' },
              plsKeep: { bsonType: 'string' }
            }
          }
        }
      });

      const appDrafts = th.app().drafts();
      const draft = await appDrafts.create();

      await services.service(syncService._id).rules().rule(createdRule._id).remove();

      let stitchError;
      try {
        await appDrafts.deploy(draft._id);
      } catch (e) {
        stitchError = e;
      }
      expect(stitchError.code).toBe('DestructiveChangeNotAllowed');

      const deployResult = await appDrafts.deploy(draft._id, { allow_destructive_changes: true });
      expect(deployResult.status).toBe('created');
    });

    it('can create a rule with invalid sync schema', async() => {
      const syncService = await createSampleMongodbSyncService(services);

      const schemaInvalidatingRule = {
        database: 'db',
        collection: 'coll',
        config: {
          schema: {
            properties: {
              _id: { bsonType: 'objectId' },
              key: { bsonType: 'string' },
              bad: { bsonType: 'null' }
            }
          }
        }
      };

      const ruleResponse = await addRuleToMongodbService(services, syncService, schemaInvalidatingRule );
      expect(ruleResponse._id).toBeTruthy();
    });

    it('can use the allow_destructive_changes param to do a destructive rule change', async() => {
      const syncService = await createSampleMongodbSyncService(services);

      const baseRule = {
        database: 'db',
        collection: 'coll',
        config: {
          schema: {
            properties: {
              _id: { bsonType: 'objectId' },
              key: { bsonType: 'string' },
              plsKeep: { bsonType: 'string' }
            }
          }
        }
      };
      const createdRule = await addRuleToMongodbService(services, syncService, baseRule);

      const destructiveRule = {
        _id: createdRule._id,
        database: 'db',
        collection: 'coll',
        schema: {
          properties: {
            _id: { bsonType: 'objectId' },
            key: { bsonType: 'string' }
          }
        }
      };

      const updateRuleFunc = services.service(syncService._id).rules().rule(createdRule._id).update;
      let stitchError;
      try {
        await updateRuleFunc(destructiveRule);
      } catch (e) {
        stitchError = e;
      }
      expect(stitchError.code).toBe('DestructiveChangeNotAllowed');

      const updateResult = await updateRuleFunc(destructiveRule, { allow_destructive_changes: true });
      expect(updateResult.status).toBe(204);
    });

    it('can use the allow_destructive_changes param to do a destructive rule remove', async() => {
      const syncService = await createSampleMongodbSyncService(services);

      const createdRule = await addRuleToMongodbService(services, syncService, {
        database: 'db',
        collection: 'coll',
        config: {
          schema: {
            properties: {
              _id: { bsonType: 'objectId' },
              key: { bsonType: 'string' },
              plsKeep: { bsonType: 'string' }
            }
          }
        }
      });

      const removeRuleFunc = services.service(syncService._id).rules().rule(createdRule._id).remove;
      let stitchError;
      try {
        await removeRuleFunc();
      } catch (e) {
        stitchError = e;
      }
      expect(stitchError.code).toBe('DestructiveChangeNotAllowed');

      const updateResult = await removeRuleFunc({ allow_destructive_changes: true });
      expect(updateResult.status).toBe(204);
    });
  });

  describe('progress', () => {
    it('should 404 if there is no active sync service', async() => {
      let errorCode;
      try {
        await sync.progress();
      } catch (e) {
        errorCode = e.response.status;
      }
      expect(errorCode).toBe(404);
    });

    it('should return a map of progress if there is an active sync service', async() => {
      await createSampleMongodbSyncService(services);
      const progressResponse = await sync.progress();
      expect(progressResponse.progress).toEqual({});
    });
  });
});
