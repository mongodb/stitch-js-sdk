import { ValidationAction, ValidationLevel, ValidationOptions } from '../src/api/v3/ValidationSettings';

import RealmMongoFixture from './fixtures/realm_mongo_fixture';
import { buildAdminTestHarness, extractTestFixtureDataPoints } from './testutil';

describe('ValidationSettings', () => {
  const test = new RealmMongoFixture();
  let th;
  let validationSettings;

  beforeAll(() => test.setup());
  afterAll(() => test.teardown());

  beforeEach(async () => {
    const { apiKey, groupId, serverUrl } = extractTestFixtureDataPoints(test);
    th = await buildAdminTestHarness(true, apiKey, groupId, serverUrl);
    validationSettings = th.app().validationSettings();
  });

  afterEach(async () => th.cleanup());

  describe('graphql', () => {
    it('exposes a .get() which returns the validation settings', async () => {
      const expected = new ValidationOptions({
        readValidationAction: ValidationAction.Error,
        readValidationLevel: ValidationLevel.Strict,
        writeValidationAction: ValidationAction.Error,
        writeValidationLevel: ValidationLevel.Strict,
      });
      const graphqlSettings = await validationSettings.graphql().get();
      expect(graphqlSettings).toEqual(expected);
    });

    it('exposes an .update() which sets the validation settings', async () => {
      const newSettings = new ValidationOptions({
        readValidationAction: ValidationAction.Error,
        readValidationLevel: ValidationLevel.Off,
        writeValidationAction: ValidationAction.Error,
        writeValidationLevel: ValidationLevel.Off,
      });

      await validationSettings.graphql().update(newSettings);
      const updatedSettings = await validationSettings.graphql().get();
      expect(updatedSettings).toEqual(newSettings);
    });
  });
});
