const StitchMongoFixture = require('../fixtures/stitch_mongo_fixture');

import { buildAdminTestHarness, extractTestFixtureDataPoints, createSampleMongodbService } from '../testutil';

describe('Realm', () => {
  let test = new StitchMongoFixture();
  let th;
  let realmConfig;
  let realmClientSchemas;
  let services;

  beforeAll(() => test.setup());
  afterAll(() => test.teardown());

  beforeEach(async() => {
    const { apiKey, groupId, serverUrl } = extractTestFixtureDataPoints(test);
    th = await buildAdminTestHarness(true, apiKey, groupId, serverUrl);
    realmConfig = th.app().realm().config();
    realmClientSchemas = th.app().realm().clientSchemas();
    services = th.app().services();
  });

  afterEach(async() => th.cleanup());

  describe('config', () => {
    it('exposes a .get() which returns the validation settings', async() => {
      const config = await realmConfig.get();
      expect(config).toEqual({
        development_mode_enabled: false
      });
    });

    it('exposes an .update() which sets the validation settings', async() => {
      const newConfig = {
        development_mode_enabled: true
      };

      await realmConfig.update(newConfig);
      const updatedConfig = await realmConfig.get();
      expect(updatedConfig).toEqual(newConfig);
    });
  });

  describe('clientSchemas', () => {
    describe('.get()', async() => {
      it('should return a 400 error if called with an unsupported language', async() => {
        try {
          await realmClientSchemas.get('PERL');
        } catch (e) {
          expect(e.response.status).toEqual(400);
          expect(e.message).toEqual("Unsupported client language: 'PERL'");
        }
      });

      it('should return a 500 error if called when no MongoDB service exists', async() => {
        try {
          await realmClientSchemas.get('KOTLIN');
        } catch (e) {
          expect(e.response.status).toEqual(500);
          expect(e.message).toEqual('error processing request');
        }
      });

      it('should return an error if called when the app has no MongoDB service rules', async() => {
        // Setup MongoDB service
        await createSampleMongodbService(services);

        try {
          await realmClientSchemas.get('KOTLIN');
        } catch (e) {
          expect(e.response.status).toEqual(500);
          expect(e.message).toEqual('error processing request');
        }
      });
    });
  });
});
