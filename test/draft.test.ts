import RealmMongoFixture from './fixtures/realm_mongo_fixture';
import { buildAdminTestHarness, extractTestFixtureDataPoints } from './testutil';

describe('Draft', () => {
  const test = new RealmMongoFixture();
  let th;
  let appDrafts;

  beforeAll(() => test.setup());
  afterAll(() => test.teardown());

  beforeEach(async () => {
    const { apiKey, groupId, serverUrl } = extractTestFixtureDataPoints(test);
    th = await buildAdminTestHarness(true, apiKey, groupId, serverUrl);
    appDrafts = th.app().drafts();
  });

  afterEach(async () => th.cleanup());

  it('responds with an empty list when no drafts exist', async () => {
    const drafts = await appDrafts.list();
    expect(drafts).toEqual([]);
  });

  it('returns a copy of the draft if one exists', async () => {
    await appDrafts.create();
    const drafts = await appDrafts.list();
    expect(drafts[0].app.groupId).toEqual(th.groupId);
  });

  it('returns a copy of the draft on a creation request', async () => {
    const draft = await appDrafts.create();
    expect(draft.app.groupId).toEqual(th.groupId);
  });

  it('returns a copy of the deploy history entry on a deploy request', async () => {
    const draft = await appDrafts.create();
    const deployHistoryEntry = await appDrafts.deploy(draft.id);
    expect(deployHistoryEntry.deployedAt).toBeDefined();
    expect(deployHistoryEntry.appId).toEqual(th.testApp.id);
  });

  it('returns "diffs" with an empty list if there are no changes', async () => {
    const draft = await appDrafts.create();
    const diffResponse = await appDrafts.diff(draft.id);
    expect(diffResponse.diffs).toEqual([]);
  });

  it('can delete a draft', async () => {
    const draft = await appDrafts.create();
    let drafts = await appDrafts.list();
    expect(drafts[0].app.groupId).toEqual(th.groupId);

    await appDrafts.delete(draft.id);
    drafts = await appDrafts.list();
    expect(drafts).toEqual([]);
  });
});
