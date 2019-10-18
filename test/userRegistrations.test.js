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

  const FunctionStatusSuccess = 'success';
  const FunctionStatusPending = 'pending';
  const FunctionStatusFail    = 'fail';
  const FunctionStatusEmpty   = '';

  beforeEach(async() => {
    const { apiKey, groupId, serverUrl } = extractTestFixtureDataPoints(test);
    th = await buildClientTestHarness(apiKey, groupId, serverUrl);
    await th.configureAnon();
    client = th.stitchClient;
    await client.logout();

    await client.register(testEmail, password);
  });

  afterEach(async() => th.cleanup());

  const getPendingUsers = async() => await th.app().userRegistrations().listPending();
  const findPendingUsersByEmail = async(email) => (await getPendingUsers()).filter(user => user.login_ids.find(k => k.id === email));
  const findPendingUsersByID = async(id) => (await getPendingUsers()).filter(user => user._id === id);

  const FUNC_NAME = 'confirmFunc';
  const createFunctionWithStatus = (status) => {return `exports = function() { return { "status": "${status}" } }`;};
  const createTestFunction = (funcSource) => ({ name: FUNC_NAME, source: funcSource });

  it('removePendingUserByEmail should remove existing pending user', async() => {
    await client.register(testEmail, password);
    let pendingUsersListByEmail = await findPendingUsersByEmail(testEmail);
    expect(pendingUsersListByEmail).toHaveLength(1);
    await th
      .app()
      .userRegistrations()
      .removePendingUserByEmail(testEmail);
    pendingUsersListByEmail = await findPendingUsersByEmail(testEmail);
    expect(pendingUsersListByEmail).toHaveLength(0);
    const allPendingUsers = await getPendingUsers();
    expect(allPendingUsers).toHaveLength(0);
    expect(await getPendingUsers()).toHaveLength(0);
  });
  it('removePendingUserByID should remove existing pending user', async() => {
    const userID = (await getPendingUsers())[0]._id;
    expect(await findPendingUsersByID(userID)).toHaveLength(1);
    await th.app().userRegistrations().removePendingUserByID(userID);
    expect(await findPendingUsersByID(userID)).toHaveLength(0);
    expect(await getPendingUsers()).toHaveLength(0);
  });
  it('runUserConfirmation should confirm existing pending user', async() => {
    expect(await findPendingUsersByEmail(testEmail)).toHaveLength(1);
    let { token_id: tokenId, token } = await th.app().userRegistrations().runUserConfirmation(testEmail);
    await client.auth.provider('userpass').emailConfirm(tokenId, token);

    // We must login first so that a user id is attached to the password record
    await client.login(testEmail, password);
    expect(client.auth.loggedInProviderType).toEqual(PROVIDER_TYPE_USERPASS);

    expect(await findPendingUsersByEmail(testEmail)).toHaveLength(0);
    expect(await getPendingUsers()).toHaveLength(0);
  });
  it('runUserConfirmation with a function that returns success should confirm pending user', async() => {
    expect(await findPendingUsersByEmail(testEmail)).toHaveLength(1);

    // Create confirm function
    let functions = th.app().functions();
    const funcSource = createFunctionWithStatus(FunctionStatusSuccess);
    let confirmFunc = await functions.create(createTestFunction(funcSource));
    expect(confirmFunc.name).toEqual(FUNC_NAME);

    // Update app with confirm function
    let providers = await th.app().authProviders().list();
    await th.app().authProviders().authProvider(providers[1]._id).update({
      config: {
        runConfirmationFunction: true,
        confirmationFunctionId: confirmFunc._id,
        confirmationFunctionName: confirmFunc.name
      }
    });
    let { token_id: tokenId, token } = await th.app().userRegistrations().runUserConfirmation(testEmail);
    expect(tokenId).toBeUndefined();
    expect(token).toBeUndefined();
    // We shouldn't need to call 'client.auth.provider('userpass').emailConfirm(tokenId, token)'

    // We must login first so that a user id is attached to the password record
    await client.login(testEmail, password);
    expect(client.auth.loggedInProviderType).toEqual(PROVIDER_TYPE_USERPASS);

    expect(await findPendingUsersByEmail(testEmail)).toHaveLength(0);
    expect(await getPendingUsers()).toHaveLength(0);
  });
  it('runUserConfirmation with a function that returns pending should not confirm user', async() => {
    expect.assertions(9);
    expect(await findPendingUsersByEmail(testEmail)).toHaveLength(1);

    // Create confirm function
    let functions = th.app().functions();
    const funcSource = createFunctionWithStatus(FunctionStatusPending);
    let confirmFunc = await functions.create(createTestFunction(funcSource));
    expect(confirmFunc.name).toEqual(FUNC_NAME);

    // Update app with confirm function
    let providers = await th.app().authProviders().list();
    await th.app().authProviders().authProvider(providers[1]._id).update({
      config: {
        runConfirmationFunction: true,
        confirmationFunctionId: confirmFunc._id,
        confirmationFunctionName: confirmFunc.name
      }
    });
    let { token_id: tokenId, token } = await th.app().userRegistrations().runUserConfirmation(testEmail);
    expect(tokenId).toBeDefined();
    expect(token).toBeDefined();

    try {
      await client.login(testEmail, password);
    } catch (e) {
      expect(e).toBeInstanceOf(Error);
      expect(e.response.status).toBe(401);
      expect(e.message).toBe('confirmation required');
    }

    expect(await findPendingUsersByEmail(testEmail)).toHaveLength(1);
    expect(await getPendingUsers()).toHaveLength(1);
  });
  it('runUserConfirmation with a function that returns empty should not confirm user', async() => {
    expect.assertions(9);
    expect(await findPendingUsersByEmail(testEmail)).toHaveLength(1);

    // Create confirm function
    let functions = th.app().functions();
    const funcSource = createFunctionWithStatus(FunctionStatusEmpty);
    let confirmFunc = await functions.create(createTestFunction(funcSource));
    expect(confirmFunc.name).toEqual(FUNC_NAME);

    // Update app with confirm function
    let providers = await th.app().authProviders().list();
    await th.app().authProviders().authProvider(providers[1]._id).update({
      config: {
        runConfirmationFunction: true,
        confirmationFunctionId: confirmFunc._id,
        confirmationFunctionName: confirmFunc.name
      }
    });
    let { token_id: tokenId, token } = await th.app().userRegistrations().runUserConfirmation(testEmail);
    expect(tokenId).toBeDefined();
    expect(token).toBeDefined();

    try {
      await client.login(testEmail, password);
    } catch (e) {
      expect(e).toBeInstanceOf(Error);
      expect(e.response.status).toBe(401);
      expect(e.message).toBe('confirmation required');
    }

    expect(await findPendingUsersByEmail(testEmail)).toHaveLength(1);
    expect(await getPendingUsers()).toHaveLength(1);
  });
  it('runUserConfirmation with a function that returns failure should not confirm user', async() => {
    expect.assertions(7);
    expect(await findPendingUsersByEmail(testEmail)).toHaveLength(1);

    // Create confirm function
    let functions = th.app().functions();
    const funcSource = createFunctionWithStatus(FunctionStatusFail);
    let confirmFunc = await functions.create(createTestFunction(funcSource));
    expect(confirmFunc.name).toEqual(FUNC_NAME);

    // Update app with confirm function
    let providers = await th.app().authProviders().list();
    await th.app().authProviders().authProvider(providers[1]._id).update({
      config: {
        runConfirmationFunction: true,
        confirmationFunctionId: confirmFunc._id,
        confirmationFunctionName: confirmFunc.name
      }
    });

    try {
      await th.app().userRegistrations().runUserConfirmation(testEmail);
    } catch (e) {
      expect(e).toBeInstanceOf(Error);
      expect(e.response.status).toBe(400);
      expect(e.message).toContain('failed to confirm user');
    }

    expect(await findPendingUsersByEmail(testEmail)).toHaveLength(1);
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
    await client.register(linkEmail, password);
    await client.login();

    let pendingUsers = await th.app().userRegistrations().listPending({limit: '5'});
    expect(pendingUsers).toHaveLength(2);

    pendingUsers = await th.app().userRegistrations().listPending({limit: '1'});
    expect(pendingUsers).toHaveLength(1);

    await th.app().userRegistrations().confirmByEmail(linkEmail);
    await client.linkWithProvider('userpass', { username: linkEmail, password });

    pendingUsers = await th.app().userRegistrations().listPending({limit: '3'});
    // one of the accounts was confirmed above, so only one registration is left pending
    expect(pendingUsers).toHaveLength(1);

    await th.app().userRegistrations().confirmByEmail(testEmail);
    await client.login(testEmail, password);
    expect(client.auth.loggedInProviderType).toEqual(PROVIDER_TYPE_USERPASS);

    // all pending accounts are confirmed, so pending list is now empty
    pendingUsers = await th.app().userRegistrations().listPending({limit: '3'});
    expect(pendingUsers).toHaveLength(0);
  });
});
