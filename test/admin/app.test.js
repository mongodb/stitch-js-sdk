const StitchMongoFixture = require('../fixtures/stitch_mongo_fixture');

import { buildAdminTestHarness, extractTestFixtureDataPoints } from '../testutil';

const assertAppsEqual = (a, b) => {
  const appA = Object.assign({}, a);
  const appB = Object.assign({}, b);

  delete appA.last_used;
  delete appB.last_used;

  expect(appA).toEqual(appB);
};

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

    assertAppsEqual(apps[0], app);
  });
  it('can fetch an existing app', async() => {
    const app = await th.createApp(testAppName);
    const appFetched = await th.app().get();
    assertAppsEqual(app, appFetched);
  });
  it('can delete an app', async() => {
    const app = await th.createApp(testAppName);
    await th.appRemove();
    th.testApp = undefined;
    const apps = (await th.apps().list()).filter(x => x._id === app._id);
    expect(apps).toHaveLength(0);
  });

  describe('when createApp is called with a specific product type', () => {
    let app;
    const otherProductTestAppName = 'atlas-app';
    beforeEach(async() => {
      app = await th.createApp(otherProductTestAppName, { product: 'atlas' });
    });
    it('should successfully create the app', () => {
      expect(app).toBeDefined();
      expect(app.name).toEqual(otherProductTestAppName);
    });

    it('should only display apps of a product type when the list function is called with that filter', async() => {
      const apps = (await th.apps().list({ product: 'atlas' }));
      expect(apps).toHaveLength(1);
      assertAppsEqual(apps[0], app);
    });
  });
});
