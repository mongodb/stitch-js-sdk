const StitchMongoFixture = require('../fixtures/stitch_mongo_fixture');

import { buildAdminTestHarness, extractTestFixtureDataPoints, createSampleMongodbService, addRuleToMongodbService } from '../testutil';

describe('Sync', () => {
  let test = new StitchMongoFixture();
  let th;
  let syncConfig;
  let syncClientSchemas;
  let services;

  beforeAll(() => test.setup());
  afterAll(() => test.teardown());

  beforeEach(async() => {
    const { apiKey, groupId, serverUrl } = extractTestFixtureDataPoints(test);
    th = await buildAdminTestHarness(true, apiKey, groupId, serverUrl);
    syncConfig = th.app().sync().config();
    syncClientSchemas = th.app().sync().clientSchemas();
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
        await addRuleToMongodbService(services, mongoDBService, {database: 'foo', collection: 'bar'});
        const schemas =  await syncClientSchemas.get('KOTLIN');
        expect(schemas.length).toEqual(1);
      });
    });
  });
});
