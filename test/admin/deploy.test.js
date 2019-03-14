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

  it('returns an empty list when requesting deploy history', async() => {
    const deployHistory = await appDeploy.deployments().list();
    expect(deployHistory).toEqual([]);
  });
});
