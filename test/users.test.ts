import { EmailPasswordRegistrationRequest } from '../src/api/v3/Users';

import RealmMongoFixture from './fixtures/realm_mongo_fixture';
import { buildAdminTestHarness, extractTestFixtureDataPoints } from './testutil';

describe('Users', () => {
  const test = new RealmMongoFixture();
  let th;
  let appUsers;

  beforeAll(() => test.setup());
  afterAll(() => test.teardown());

  beforeEach(async () => {
    const { apiKey, groupId, serverUrl } = extractTestFixtureDataPoints(test);
    th = await buildAdminTestHarness(true, apiKey, groupId, serverUrl);
    appUsers = th.app().users();

    const newProvider = await th.configureUserpass();
    expect(newProvider.type).toEqual('local-userpass');
    expect(newProvider.name).toEqual('local-userpass');
    expect(newProvider.config).toBeUndefined();
  });

  afterEach(async () => th.cleanup());

  it('listing users should return empty list', async () => {
    const users = await appUsers.list();
    expect(users).toEqual([]);
  });

  it('users count should return 0', async () => {
    const count = await appUsers.count();
    expect(count).toEqual(0);
  });

  const testUserName = 'testusername@test.com';

  /** @returns {Object} user */
  async function createUserWithExpectation() {
    let users = await appUsers.list();
    let count = await appUsers.count();
    expect(users).toEqual([]);
    expect(users.length).toEqual(count);
    await appUsers.create(
      new EmailPasswordRegistrationRequest({
        email: testUserName,
        password: 'admin123',
      })
    );
    users = await appUsers.list();
    count = await appUsers.count();
    expect(users).toHaveLength(1);
    expect(users.length).toEqual(count);
    expect(users[0].data.email).toEqual(testUserName);
    return users[0];
  }

  /** @returns {Object} user */
  async function fetchUserByIdWithExpectation() {
    const createdUser = await createUserWithExpectation();
    const fetchedUser = await appUsers.user(createdUser.id).get();
    expect(fetchedUser.id).toEqual(createdUser.id);
    expect(fetchedUser.data).toEqual(createdUser.data);
    expect(fetchedUser.identities).toEqual(createdUser.identities);
    expect(fetchedUser.type).toEqual(createdUser.type);
    return fetchedUser;
  }

  async function fetchUserDevicesWithExpectation() {
    await th.setupRealmClient(false);
    const devices = await appUsers.user(th.user.id).devices().get();
    expect(devices.length).toEqual(1);
    expect(devices[0].platform).toEqual('node');
  }

  it('creating user should make it appear in list', async () => {
    await createUserWithExpectation();
  });

  it('can fetch a user by id', async () => {
    await fetchUserByIdWithExpectation();
  });

  it('can fetch a users devices', async () => {
    await fetchUserDevicesWithExpectation();
  });

  it('can remove a user by id', async () => {
    const user = await fetchUserByIdWithExpectation();
    await appUsers.user(user.id).remove();
    const users = await appUsers.list();
    expect(users).toHaveLength(0);
  });

  it('can logout a user by id', async () => {
    const user = await fetchUserByIdWithExpectation();
    const { status } = await appUsers.user(user.id).logout();
    expect(status).toBe(204);
  });

  it('can enable/disable a user by id', async () => {
    const user = await fetchUserByIdWithExpectation();
    expect(user.disabled).toBe(false);

    await appUsers.user(user.id).disable();
    let fetchedUser = await appUsers.user(user.id).get();
    expect(fetchedUser.disabled).toBe(true);

    await appUsers.user(user.id).enable();
    fetchedUser = await appUsers.user(user.id).get();
    expect(user.disabled).toBe(false);
  });
});
