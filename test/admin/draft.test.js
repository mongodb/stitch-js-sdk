const StitchMongoFixture = require('../fixtures/stitch_mongo_fixture');

import { buildAdminTestHarness, extractTestFixtureDataPoints } from '../testutil';

describe('Draft', () => {
  let test = new StitchMongoFixture();
  let th;
  let appDrafts;

  beforeAll(() => test.setup());
  afterAll(() => test.teardown());

  beforeEach(async() => {
    const { apiKey, groupId, serverUrl } = extractTestFixtureDataPoints(test);
    th = await buildAdminTestHarness(true, apiKey, groupId, serverUrl);
    appDrafts = th.app().drafts();
  });

  afterEach(async() => th.cleanup());

  it('responds with an empty list when no drafts exist', async() => {
    const drafts = await appDrafts.list();
    expect(drafts).toEqual([]);
  });

  it('returns a copy of the draft if one exists', async() => {
    await appDrafts.create();
    const drafts = await appDrafts.list();
    expect(drafts[0].app.group_id).toEqual(th.groupId);
  });

  it('returns a copy of the draft on a creation request', async() => {
    const draft = await appDrafts.create();
    expect(draft.app.group_id).toEqual(th.groupId);
  });

  it('returns a copy of the deploy history entry on a deploy request', async() => {
    const draft = await appDrafts.create();
    const deployHistoryEntry = await appDrafts.deploy(draft._id);
    expect(deployHistoryEntry.deployed_at).toBeDefined();
    expect(deployHistoryEntry.app_id).toEqual(th.testApp._id);
  });

  it('returns "diffs" with an empty list if there are no changes', async() => {
    const draft = await appDrafts.create();
    const diffResponse = await appDrafts.diff(draft._id);
    expect(diffResponse.diffs).toEqual([]);
  });
});
