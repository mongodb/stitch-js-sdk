const StitchMongoFixture = require('../fixtures/stitch_mongo_fixture');

import { getAuthenticatedClient } from '../testutil';

describe('App Logs V2', () => {
  let test = new StitchMongoFixture();
  let app;
  let apps;
  let logs;
  beforeAll(() => test.setup());
  afterAll(() => test.teardown());
  beforeEach(async () => {
    let adminClient = await getAuthenticatedClient(test.userData.apiKey.key);
    test.groupId = test.userData.group.groupId;
    apps = await adminClient.v2().apps(test.groupId);
    app = await apps.create({ name: 'testname' });
    logs = adminClient.v2().apps(test.groupId).app(app._id).logs();
  });
  afterEach(async () => {
    await apps.app(app._id).remove();
  });

  it('responds with an empty list of logs', async () => {
    let logsResponse = await logs.list();
    expect(logsResponse).toEqual([]);
  });
});
