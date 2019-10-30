const StitchMongoFixture = require('../fixtures/stitch_mongo_fixture');

import { buildAdminTestHarness, extractTestFixtureDataPoints } from '../testutil';

describe('Dependencies', () => {
  let test = new StitchMongoFixture();
  let th;
  let dependencies;

  beforeAll(() => test.setup());
  afterAll(() => test.teardown());

  beforeEach(async() => {
    const { apiKey, groupId, serverUrl } = extractTestFixtureDataPoints(test);
    th = await buildAdminTestHarness(true, apiKey, groupId, serverUrl);
    dependencies = th.app().dependencies();
  });

  afterEach(async() => th.cleanup());

  it('listing dependencies should return an error when there are no dependencies', async() => {
    let deps = dependencies.list();
    await expect(deps).rejects.toBeDefined();
  });
});
