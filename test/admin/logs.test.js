const StitchMongoFixture = require('../fixtures/stitch_mongo_fixture');

import { buildAdminTestHarness, extractTestFixtureDataPoints } from '../testutil';

describe('App Logs', () => {
  let test = new StitchMongoFixture();
  let th;
  let logs;

  beforeAll(() => test.setup());
  afterAll(() => test.teardown());

  beforeEach(async() => {
    const { apiKey, groupId, serverUrl } = extractTestFixtureDataPoints(test);
    th = await buildAdminTestHarness(true, apiKey, groupId, serverUrl);
    logs = th.app().logs();
  });

  afterEach(async() => th.cleanup());

  it('responds with an empty list of logs', async() => {
    let logsResponse = await logs.list();
    expect(logsResponse).toEqual([]);
  });
});
