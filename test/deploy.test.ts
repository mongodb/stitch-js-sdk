import { AutomaticDeploymentConfig, PartialCodeDeploy } from '../src/api/v3/CodeDeploy';

import RealmMongoFixture from './fixtures/realm_mongo_fixture';
import { buildAdminTestHarness, extractTestFixtureDataPoints } from './testutil';

describe('Deploy', () => {
  const test = new RealmMongoFixture();
  let th;
  let appDeploy;

  beforeAll(() => test.setup());
  afterAll(() => test.teardown());

  beforeEach(async () => {
    const { apiKey, groupId, serverUrl } = extractTestFixtureDataPoints(test);
    th = await buildAdminTestHarness(true, apiKey, groupId, serverUrl);
    appDeploy = th.app().deploy();
  });

  afterEach(async () => th.cleanup());

  describe('when requesting the deploy config', () => {
    it('returns the current config', async () => {
      const deployConfig = await appDeploy.config();
      expect(deployConfig.automaticDeploymentConfig.enabled).toEqual(false);
    });
  });

  describe('when updating the deploy config', () => {
    it('returns something', async () => {
      const { status } = await appDeploy.updateConfig(
        new PartialCodeDeploy({
          automaticDeploymentConfig: new AutomaticDeploymentConfig({
            enabled: false,
            repository: undefined,
          }),
        })
      );
      expect(status).toBe(204);
    });
  });

  describe('when overwriting the deploy config', () => {
    it('returns something', async () => {
      const { status } = await appDeploy.overwriteConfig({});
      expect(status).toBe(204);
    });
  });
});
