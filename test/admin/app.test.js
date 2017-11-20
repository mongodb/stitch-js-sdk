const StitchMongoFixture = require('../fixtures/stitch_mongo_fixture');

import { buildAdminTestHarness, extractTestFixtureDataPoints } from '../testutil';

describe('Apps', ()=>{
  let test = new StitchMongoFixture();
  let th;

  beforeAll(() => test.setup());
  afterAll(() => test.teardown());

  beforeEach(async() => {
    const { apiKey, groupId, serverUrl } = extractTestFixtureDataPoints(test);
    th = await buildAdminTestHarness(false, apiKey, groupId, serverUrl);
  });

  afterEach(async() => th.cleanup());

  it('listing apps should return empty list', async() => {
    let apps = await th.apps().list();
    expect(apps).toEqual([]);
  });

  const testAppName = 'testapp';
  it('can create an app successfully', async() => {
    const app = await th.createApp(testAppName);
    expect(app).toBeDefined();
    expect(app.name).toEqual(testAppName);
  });
  it('newly created app should appear in list', async() => {
    const app = await th.createApp(testAppName);
    const apps = (await th.apps().list()).filter(x => x._id === app._id);
    expect(apps).toHaveLength(1);
    expect(apps[0]).toEqual(app);
  });
  it('can fetch an existing app', async() => {
    const app = await th.createApp(testAppName);
    const appFetched = await th.app().get();
    expect(app).toEqual(appFetched);
  });
  it('can delete an app', async() => {
    const app = await th.createApp(testAppName);
    await th.appRemove();
    th.testApp = undefined;
    const apps = (await th.apps().list()).filter(x => x._id === app._id);
    expect(apps).toHaveLength(0);
  });
});
