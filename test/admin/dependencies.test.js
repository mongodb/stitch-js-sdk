import StitchMongoFixture from '../fixtures/stitch_mongo_fixture';
import {
  buildAdminTestHarness,
  extractTestFixtureDataPoints
} from '../testutil';
import fs from 'fs';

describe('Dependencies', () => {
  let test = new StitchMongoFixture();
  let th;
  let dependencies;
  let appDeploy;

  beforeAll(() => test.setup());
  afterAll(() => test.teardown());

  beforeEach(async() => {
    const { apiKey, groupId, serverUrl } = extractTestFixtureDataPoints(test);
    th = await buildAdminTestHarness(true, apiKey, groupId, serverUrl);
    dependencies = th.app().dependencies();
    appDeploy = th.app().deploy();
  });

  afterEach(async() => th.cleanup());

  it('listing dependencies should return an empty array when there are no dependencies', async() => {
    let deps = await dependencies.list();
    expect(deps.dependencies_list).toHaveLength(0);
  });

  describe('creating dependencies should work', () => {
    let filePath;
    let fileBody;

    beforeEach(async() => {
      filePath = 'axios-0.19.0-node_modules.tar';
      fileBody = fs.readFileSync(`./test/admin/testdata/${filePath}`);
    });

    it('and create a new deploy job', async() => {
      const response = await dependencies.upload(filePath, fileBody);
      expect(response.status).toBe(204);

      let deployments = await appDeploy.deployments().list();
      expect(deployments[0].status).toEqual('pending');
    });
  });
});
