import StitchMongoFixture from './fixtures/stitch_mongo_fixture';
import { PROVIDER_TYPE_USERPASS } from '../src/auth/providers';
import { buildClientTestHarness, extractTestFixtureDataPoints } from './testutil';


describe('User Registrations', ()=>{
  let test = new StitchMongoFixture();
  let th;
  let client;

  beforeAll(() => test.setup());
  afterAll(() => test.teardown());

  const linkEmail = 'link_user@10gen.com';
  const testEmail = 'test_user@10gen.com';
  const password = '123456';

  beforeEach(async() => {
    const { apiKey, groupId, serverUrl } = extractTestFixtureDataPoints(test);
    th = await buildClientTestHarness(apiKey, groupId, serverUrl);
    await th.configureAnon();
    client = th.stitchClient;
    await client.logout();
  });

  afterEach(async() => th.cleanup());

  const getPendingUsers = async() => await th.app().userRegistrations().listPending();
  const findPendingUsersByEmail = async(email) => (await getPendingUsers()).filter(user => user.login_ids.find(k => k.id === email));
  const findPendingUsersByID = async(id) => (await getPendingUsers()).filter(user => user._id === id);

  it('removePendingUserByEmail should remove existing pending user', async() => {
    await client.register(testEmail, password);
    expect(await findPendingUsersByEmail(testEmail)).toHaveLength(1);
    await th.app().userRegistrations().removePendingUserByEmail(testEmail);
    expect(await findPendingUsersByEmail(testEmail)).toHaveLength(0);
    expect(await getPendingUsers()).toHaveLength(1);
  });
  it('removePendingUserByID should remove existing pending user', async() => {
    await client.register(testEmail, password);
    const userID = (await getPendingUsers())[0]._id;
    expect(await findPendingUsersByID(userID)).toHaveLength(1);
    await th.app().userRegistrations().removePendingUserByID(userID);
    expect(await findPendingUsersByID(userID)).toHaveLength(0);
    expect(await getPendingUsers()).toHaveLength(1);
  });
  it('should link a user that was confirmed via `confirmByEmail` with associated provider', async() => {
    const userId = await client.login();
    const { identities } = await client.userProfile();
    expect(identities.length).toEqual(1);

    await client.register(linkEmail, password);

    await th.app().userRegistrations().confirmByEmail(linkEmail);
    const newUserId = await client.linkWithProvider('userpass', { username: linkEmail, password });
    expect(userId).toEqual(newUserId);

    const { identities: newIdentities } = await client.userProfile();
    expect(newIdentities.length).toEqual(2);

    expect(newIdentities[0].provider_type).toEqual('anon-user');
    expect(newIdentities[1].provider_type).toEqual('local-userpass');
  });
  it('should list pending users', async() => {
    await client.register(testEmail, password);
    await client.login();
    await client.register(linkEmail, password);

    let pendingUsers = await th.app().userRegistrations().listPending({limit: '5'});
    expect(pendingUsers).toHaveLength(3);

    pendingUsers = await th.app().userRegistrations().listPending({limit: '1'});
    expect(pendingUsers).toHaveLength(1);

    await th.app().userRegistrations().confirmByEmail(linkEmail);
    await client.linkWithProvider('userpass', { username: linkEmail, password });

    pendingUsers = await th.app().userRegistrations().listPending({limit: '3'});
    expect(pendingUsers).toHaveLength(2);

    await th.app().userRegistrations().confirmByEmail(testEmail);
    await client.login(testEmail, password);
    expect(client.auth.loggedInProviderType).toEqual(PROVIDER_TYPE_USERPASS);

    pendingUsers = await th.app().userRegistrations().listPending({limit: '3'});
    expect(pendingUsers).toHaveLength(1);
  });
});
