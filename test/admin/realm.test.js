const StitchMongoFixture = require('../fixtures/stitch_mongo_fixture');

import { buildAdminTestHarness,
  extractTestFixtureDataPoints } from '../testutil';

describe('Realm', () => {
  let test = new StitchMongoFixture();
  let th;
  let realmConfig;

  beforeAll(() => test.setup());
  afterAll(() => test.teardown());

  beforeEach(async() => {
    const { apiKey, groupId, serverUrl } = extractTestFixtureDataPoints(test);
    th = await buildAdminTestHarness(true, apiKey, groupId, serverUrl);
    realmConfig = th.app().realm().config();
  });

  afterEach(async() => th.cleanup());

  describe('config', () => {
    it('exposes a .get() which returns the validation settings', async() => {
      const config = await realmConfig.get();
      expect(config).toEqual({
        developmentModeEnabled: false
      });
    });

    it('exposes an .update() which sets the validation settings', async() => {
      const newConfig = {
        developmentModeEnabled: true
      };

      await realmConfig.update(newConfig);
      const updatedConfig = await realmConfig.get();
      expect(updatedConfig).toEqual(newConfig);
    });
  });
});
