const StitchMongoFixture = require('../fixtures/stitch_mongo_fixture');

import { buildAdminTestHarness, extractTestFixtureDataPoints } from '../testutil';

describe('Deploy', () => {
  let test = new StitchMongoFixture();
  let th;
  let appDeploy;

  beforeAll(() => test.setup());
  afterAll(() => test.teardown());

  beforeEach(async() => {
    const { apiKey, groupId, serverUrl } = extractTestFixtureDataPoints(test);
    th = await buildAdminTestHarness(true, apiKey, groupId, serverUrl);
    appDeploy = th.app().deploy();
  });

  afterEach(async() => th.cleanup());

  describe('when requesting the deploy history', () => {
    it('returns a list containing the initial deploy', async() => {
      const deployHistory = await appDeploy.deployments().list();
      expect(deployHistory[0].status).toEqual('successful');
    });
  });

  describe('when requesting the deploy config', () => {
    it('returns the current config with an empty list of authenticated_repositories', async() => {
      const deployConfig = await appDeploy.config();
      expect(deployConfig.automatic_deployment.authenticated_repositories).toEqual([]);
    });
  });

  describe('when updating the deploy config', () => {
    it('returns something', async() => {
      const { status } = await appDeploy.updateConfig({
        enabled: false,
        automatic_deployment: {
          enabled: false,
          repository: null,
          authenticated_repositories: []
        }
      });
      expect(status).toBe(204);
    });
  });
});
