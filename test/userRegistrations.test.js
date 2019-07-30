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
    // console.log(client);
    await client.logout();
  });

  afterEach(async() => th.cleanup());

  it('removePendingUserByEmail should remove existing user', async() => {
    await client.register(testEmail, password);
    let users = await th.app().userRegistrations().listPending({limit: '1'});
    expect(users).toHaveLength(1);
    await th.app().userRegistrations().removePendingUserByEmail(testEmail);
    users = await th.app().userRegistrations().listPending({limit: '1'});
    expect(users).toHaveLength(0);
  });
  it('removePendingUserByID should remove existing user', async() => {
    await client.register(testEmail, password);
    let users = await th.app().userRegistrations().listPending({limit: '1'});
    expect(users).toHaveLength(1);
    await th.app().userRegistrations().removePendingUserByID(users[0]._id);
    users = await th.app().userRegistrations().listPending({limit: '1'});
    expect(users).toHaveLength(0);
  });
});
