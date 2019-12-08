const StitchMongoFixture = require('../fixtures/stitch_mongo_fixture');

import { buildAdminTestHarness,
  extractTestFixtureDataPoints } from '../testutil';

describe('ValidationSettings', () => {
  let test = new StitchMongoFixture();
  let th;
  let validationSettings;

  beforeAll(() => test.setup());
  afterAll(() => test.teardown());

  beforeEach(async() => {
    const { apiKey, groupId, serverUrl } = extractTestFixtureDataPoints(test);
    th = await buildAdminTestHarness(true, apiKey, groupId, serverUrl);
    validationSettings = th.app().validationSettings();
  });

  afterEach(async() => th.cleanup());

  describe('graphql', () => {
    it('exposes a .get() which returns the validation settings', async() => {
      const graphqlSettings = await validationSettings.graphql().get();
      expect(graphqlSettings).toEqual({
        read_validation_action: 'ERROR',
        read_validation_level: 'STRICT',
        write_validation_action: 'ERROR',
        write_validation_level: 'STRICT'
      });
    });

    it('exposes an .update() which sets the validation settings', async() => {
      const newSettings = {
        read_validation_action: 'ERROR',
        read_validation_level: 'OFF',
        write_validation_action: 'ERROR',
        write_validation_level: 'OFF'
      };

      await validationSettings.graphql().update(newSettings);
      const updatedSettings = await validationSettings.graphql().get();
      expect(updatedSettings).toEqual(newSettings);
    });
  });
});
