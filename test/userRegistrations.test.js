import StitchMongoFixture from './fixtures/stitch_mongo_fixture';

import { buildClientTestHarness, extractTestFixtureDataPoints } from './testutil';


describe('User Registrations', ()=>{
  let test = new StitchMongoFixture();
  let th;
  let client;

  beforeAll(() => test.setup());
  afterAll(() => test.teardown());

  const testEmail = 'link_user@10gen.com';
  const password = '123456';

  beforeEach(async() => {
    const { apiKey, groupId, serverUrl } = extractTestFixtureDataPoints(test);
    th = await buildClientTestHarness(apiKey, groupId, serverUrl);
    client = th.stitchClient;
    await client.logout();
  });

  afterEach(async() => th.cleanup());

  const getPendingUsers = async() => await th.app().userRegistrations().listPending();
  const findUserByEmail = async(email) => (await getPendingUsers()).filter(user => user.login_ids.find(k => k.id === email));
  const findUserByID = async(id) => (await getPendingUsers()).filter(user => user._id === id);

  it('removePendingUserByEmail should remove existing pending user', async() => {
    await client.register(testEmail, password);
    expect(await findUserByEmail(testEmail)).toHaveLength(1);
    await th.app().userRegistrations().removePendingUserByEmail(testEmail);
    expect(await findUserByEmail(testEmail)).toHaveLength(0);
    expect(await getPendingUsers()).toHaveLength(1);

  });
  it('removePendingUserByID should remove existing pending user', async() => {
    await client.register(testEmail, password);
    const userID = (await getPendingUsers())[0]._id;
    expect(await findUserByID(userID)).toHaveLength(1);
    await th.app().userRegistrations().removePendingUserByID(userID);
    expect(await findUserByID(userID)).toHaveLength(0);
    expect(await getPendingUsers()).toHaveLength(1);
  });
});
