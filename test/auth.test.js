import sinon from 'sinon';
import StitchClient from '../src/client';
import * as common from '../src/auth/common';
import { PROVIDER_TYPE_ANON, PROVIDER_TYPE_USERPASS } from '../src/auth/providers';
import StitchMongoFixture from './fixtures/stitch_mongo_fixture';
import { buildClientTestHarness, extractTestFixtureDataPoints } from './testutil';

function mockAuthData() {
  const data = {
    accessToken: 'fake-access-token',
    refreshToken: 'fake-refresh-token',
    userId: 'fake-user-id',
    deviceId: 'fake-device-id'
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

    let client = new StitchClient();
    await client.auth.storage.set(common.USER_AUTH_KEY, mockAuthData());
    await client.auth.storage.set(common.USER_LOGGED_IN_PT_KEY, PROVIDER_TYPE_ANON);
    return client.login()
      .then(userId => expect(userId).toEqual('fake-user-id'));
  });

  it('should return a promise for login with only new auth data userId', () => {
    window.fetch.resolves(mockApiResponse({
      body: {
        access_token: 'fake-access-token',
        refresh_token: 'fake-refresh-token',
        user_id: 'fake-user-id',
        device_id: 'fake-device-id'
      }
    }));
    expect.assertions(1);

    let client = new StitchClient();

    return client.login('email', 'password')
      .then(userId => expect(userId).toEqual('fake-user-id'));
  });
});

describe('Auth login semantics', () => {
  const email = 'test_user@domain.com';
  const password = 'password';
  let test = new StitchMongoFixture();
  let th;
  let client;

  beforeAll(test.setup());
  afterAll(test.teardown());

  beforeEach(async() => {
    const { apiKey, groupId, serverUrl } = extractTestFixtureDataPoints(test);
    th = await buildClientTestHarness(apiKey, groupId, serverUrl);
    await th.configureAnon();
    client = th.stitchClient;
  });

  afterEach(th.cleanup());

  it('should track currently logged in provider type', async() => {
    await client.login();
    expect(await client.auth.storage.get(common.USER_LOGGED_IN_PT_KEY)).toEqual(PROVIDER_TYPE_ANON);
    await client.login(email, password);
    expect(await client.auth.storage.get(common.USER_LOGGED_IN_PT_KEY)).toEqual(PROVIDER_TYPE_USERPASS);
    await client.logout();
    expect(await client.auth.storage.get(common.USER_LOGGED_IN_PT_KEY)).toEqual(null);
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
    const auth = await client.auth._get();
    await client.login(email, password);
    expect(auth).not.toEqual(await client.auth._get());
  });

  it('should not be authenticated before log in', async() => {
    await client.logout();
    expect(await client.isAuthenticated()).toEqual(false);
    await client.login(email, password);
    expect(await client.isAuthenticated()).toEqual(true);
  });
});
