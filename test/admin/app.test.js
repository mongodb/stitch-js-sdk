const StitchMongoFixture = require('../fixtures/stitch_mongo_fixture');
import {getAuthenticatedClient} from '../testutil';

describe('Apps V2', ()=>{
  let test = new StitchMongoFixture();
  let apiV2;
  beforeAll(() => test.setup());
  afterAll(() => test.teardown());
  beforeEach(async () =>{
    let adminClient = await getAuthenticatedClient(test.userData.apiKey.key);
    test.groupId = test.userData.group.groupId;
    apiV2 = adminClient.v2();
  });

  it('listing apps should return empty list', async () => {
    let apps = await apiV2.apps(test.groupId).list();
    expect(apps).toEqual([]);
  });

  const testAppName = 'testapp';
  it('can create an app successfully', async () => {
    const app = await apiV2.apps(test.groupId).create({name: testAppName});
    expect(app).toBeDefined();
    expect(app.name).toEqual(testAppName);
  });
  it('newly created app should appear in list', async () => {
    const app = await apiV2.apps(test.groupId).create({name: testAppName});
    const apps = (await apiV2.apps(test.groupId).list()).filter(x => x._id === app._id);
    expect(apps).toHaveLength(1);
    expect(apps[0]).toEqual(app);
  });
  it('can fetch an existing app', async () => {
    const app = await apiV2.apps(test.groupId).create({name: testAppName});
    const appFetched = await apiV2.apps(test.groupId).app(app._id).get();
    expect(app).toEqual(appFetched);
  });
  it('can delete an app', async () => {
    let app = await apiV2.apps(test.groupId).create({name: testAppName});
    await apiV2.apps(test.groupId).app(app._id).remove();
    const apps = (await apiV2.apps(test.groupId).list()).filter(x => x._id === app._id);
    expect(apps).toHaveLength(0);
  });
});
