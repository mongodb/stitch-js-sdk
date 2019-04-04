const StitchMongoFixture = require('../fixtures/stitch_mongo_fixture');

import { buildAdminTestHarness, extractTestFixtureDataPoints } from '../testutil';

describe('Draft', () => {
  let test = new StitchMongoFixture();
  let th;
  let appDraft;

  beforeAll(() => test.setup());
  afterAll(() => test.teardown());

  beforeEach(async() => {
    const { apiKey, groupId, serverUrl } = extractTestFixtureDataPoints(test);
    th = await buildAdminTestHarness(true, apiKey, groupId, serverUrl);
    appDraft = th.app().draft();
  });

  afterEach(async() => th.cleanup());

  it('responds with a 404 when attempting to get a draft that does not exist', async() => {
    try {
      await appDraft.get();
    } catch (error) {
      expect(error.response.status).toEqual(404);
      expect(error.message).toEqual('draft not found');
    }
    expect.assertions(2);
  });

  it('returns a copy of the draft if one exists', async() => {
    await appDraft.create();
    const draft = await appDraft.get();
    expect(draft.app.group_id).toEqual(th.groupId);
  });

  it('returns a copy of the draft on a creation request', async() => {
    const draft = await appDraft.create();
    expect(draft.app.group_id).toEqual(th.groupId);
  });

  it('returns a copy of the deploy history entry on a deploy request', async() => {
    await appDraft.create();
    const deployHistoryEntry = await appDraft.deploy();
    expect(deployHistoryEntry.deployed_at).toBeDefined();
    expect(deployHistoryEntry.app_id).toEqual(th.testApp._id);
  });

  it('returns an "diffs" with an empty list if there are no changes', async() => {
    await appDraft.create();
    const diffResponse = await appDraft.diff();
    expect(diffResponse.diffs).toEqual([]);
  });
});
