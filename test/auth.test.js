import sinon from 'sinon';
import { StitchClientFactory } from '../src/client';
import { PROVIDER_TYPE_ANON, PROVIDER_TYPE_USERPASS } from '../src/auth/providers';
import { StitchError, ErrUnauthorized } from '../src/errors';
import StitchMongoFixture from './fixtures/stitch_mongo_fixture';
import { buildClientTestHarness, extractTestFixtureDataPoints } from './testutil';

function mockAuthData() {
  const data = {
    access_token: 'fake-access-token',
    refresh_token: 'fake-refresh-token',
    user_id: 'fake-user-id',
    device_id: 'fake-device-id'
  };

  return JSON.stringify(data);
}

function mockApiResponse(options = {}) {
  let headers = {};
  let body = 'null';
  if (options.body) {
    headers['Content-type'] = 'application/json';
    body = JSON.stringify(options.body);
  }

  const responseOptions =
    Object.assign({}, { status: 200, headers: headers }, options);
  return new window.Response(body, responseOptions);
}

describe('Auth', () => {
  let test = {};

  beforeEach(() => {
    test.fetch = sinon.stub(window, 'fetch');
  });

  afterEach(() => test.fetch.restore());

  it('should return a promise for anonymous login with existing auth data', async() => {
    window.fetch.resolves(mockApiResponse());
    expect.assertions(1);

    let client = await StitchClientFactory.create();

    client.auth.set(JSON.parse(mockAuthData()), PROVIDER_TYPE_ANON);

    return client.login()
      .then(userId => expect(userId).toEqual('fake-user-id'));
  });

  it('should return a promise for login with only new auth data userId', async() => {
    window.fetch.resolves(mockApiResponse({
      body: {
        access_token: 'fake-access-token',
        refresh_token: 'fake-refresh-token',
        user_id: 'fake-user-id',
        device_id: 'fake-device-id'
      }
    }));
    expect.assertions(1);

    let client = await StitchClientFactory.create();

    expect(await client.login('email', 'password')).toEqual('fake-user-id');
  });

  it('should fail trying to do an authed action', async() => {
    expect.assertions(1);

    let client = await StitchClientFactory.create();

    await expect(client.executeServiceFunction('someService', 'someAction')).rejects
      .toEqual(new StitchError('Must auth first', ErrUnauthorized));
  });
});

describe('Auth linking', () => {
  const linkEmail = 'link_user@10gen.com';
  const password = 'password';
  let test = new StitchMongoFixture();
  let th;
  let client;

  beforeAll(async() => test.setup());
  afterAll(async() => test.teardown());

  beforeEach(async() => {
    const { apiKey, groupId, serverUrl } = extractTestFixtureDataPoints(test);
    th = await buildClientTestHarness(apiKey, groupId, serverUrl);
    await th.configureAnon();
    client = th.stitchClient;
    await client.logout();
  });

  afterEach(async() => th.cleanup());

  it('should link two accounts', async() => {
    const userId = await client.login();
    const { identities } = await client.userProfile();
    expect(identities.length).toEqual(1);

    await client.register(linkEmail, password);

    let { token_id: tokenId, token } = await th.app().userRegistrations().sendConfirmationEmail(linkEmail);
    await client.auth.provider('userpass').emailConfirm(tokenId, token);
    const newUserId = await client.linkWithProvider('userpass', { username: linkEmail, password });
    expect(userId).toEqual(newUserId);

    const { identities: newIdentities } = await client.userProfile();
    expect(newIdentities.length).toEqual(2);

    expect(newIdentities[0].provider_type).toEqual('anon-user');
    expect(newIdentities[1].provider_type).toEqual('local-userpass');
  });

  it('should fail if not authenticated', async() => {
    await client.register(linkEmail, password);

    let { token_id: tokenId, token } = await th.app().userRegistrations().sendConfirmationEmail(linkEmail);
    await client.auth.provider('userpass').emailConfirm(tokenId, token);
    try {
      await client.linkWithProvider('userpass', { username: linkEmail, password });
    } catch (error) {
      expect(error).toBeDefined();
    }
  });
});

describe('Auth login semantics', () => {
  const email = 'test_user@domain.com';
  const password = 'password';
  let test = new StitchMongoFixture();
  let th;
  let client;

  beforeAll(async() => test.setup());
  afterAll(async() => test.teardown());

  beforeEach(async() => {
    const { apiKey, groupId, serverUrl } = extractTestFixtureDataPoints(test);
    th = await buildClientTestHarness(apiKey, groupId, serverUrl);
    await th.configureAnon();
    client = th.stitchClient;
    await client.logout();
  });

  afterEach(async() => th.cleanup());

  it('should track currently logged in provider type', async() => {
    await client.login();
    expect(client.auth.loggedInProviderType).toEqual(PROVIDER_TYPE_ANON);
    await client.login(email, password);
    expect(client.auth.loggedInProviderType).toEqual(PROVIDER_TYPE_USERPASS);
    await client.logout();
    expect(client.auth.loggedInProviderType).toEqual(null);
  });

  it('should return existing login for relogging "anon"', async() => {
    const userId = await client.login();
    expect(userId).toEqual(await client.login());
  });

  it('should login with a new provider if switching providers', async() => {
    const userId = await client.login();
    expect(userId).not.toEqual(await client.login(email, password));
  });

  it('should re-login with the same provider if not anon', async() => {
    await client.login(email, password);
    const auth = client.auth.auth;
    await client.login(email, password);
    expect(auth.accessToken).not.toEqual(client.auth.getAccessToken());
  });

  it('should not be authenticated before log in', async() => {
    expect(client.isAuthenticated()).toEqual(false);
    await client.login(email, password);
    expect(client.isAuthenticated()).toEqual(true);
  });
});
