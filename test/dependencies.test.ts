import { DeploymentStatus } from '../src/api/v3/Deployments';

import RealmMongoFixture from './fixtures/realm_mongo_fixture';
import { buildAdminTestHarness, extractTestFixtureDataPoints } from './testutil';

import fs from 'fs';

describe('Dependencies', () => {
  const test = new RealmMongoFixture();
  let th;
  let dependencies;
  let appDeploy;

  beforeAll(() => test.setup());
  afterAll(() => test.teardown());

  beforeEach(async () => {
    const { apiKey, groupId, serverUrl } = extractTestFixtureDataPoints(test);
    th = await buildAdminTestHarness(true, apiKey, groupId, serverUrl);
    dependencies = th.app().dependencies();
    appDeploy = th.app().deploy();
  });

  afterEach(async () => th.cleanup());

  it('listing dependencies should return an empty array when there are no dependencies', async () => {
    const deps = await dependencies.list();
    expect(deps.dependenciesList).toHaveLength(0);
  });

  describe('creating dependencies should work', () => {
    let filePath;
    let fileBody;

    beforeEach(async () => {
      filePath = 'axios-0.19.0-node_modules.tar';
      fileBody = fs.readFileSync(`./test/testdata/${filePath}`);
    });

    it('and create a new deploy job', async () => {
      const response = await dependencies.upload(filePath, fileBody);
      expect(response.status).toBe(204);

      const deployments = await appDeploy.deployments().list();
      expect(deployments[0].status).toEqual(DeploymentStatus.Pending);
    });
  });
});
