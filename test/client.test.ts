import { PartialApp } from '../src/api/v3/Apps';
import { AuthProviderType } from '../src/api/v3/AuthProviders';
import { UserProfile, UserType } from '../src/api/v3/Users';
import { REFRESH_TOKEN_KEY } from '../src/auth/Common';
import RealmAdminClient from '../src/Client';
import { JSONTYPE } from '../src/Common';
import { ErrUnauthorized, RealmError } from '../src/Errors';

import RealmMongoFixture from './fixtures/realm_mongo_fixture';
import { buildAdminTestHarness, extractTestFixtureDataPoints } from './testutil';

import fetchMock from 'fetch-mock';
import { JsonConvert } from 'json2typescript';
import { mocks } from 'mock-browser';
import { Response } from 'node-fetch';
import * as sinon from 'ts-sinon';
const jsonConvert: JsonConvert = new JsonConvert();

const APIKEY_AUTH_URL = 'https://realm.mongodb.com/api/admin/v3.0/auth/providers/api-key/login';
const LOCALAUTH_URL = 'https://realm.mongodb.com/api/admin/v3.0/auth/providers/local-userpass/login';

const LIST_APPS_URL = 'https://realm.mongodb.com/api/admin/v3.0/groups/foo/apps';
const SESSION_URL = 'https://realm.mongodb.com/api/admin/v3.0/auth/session';
const PROFILE_URL = 'https://realm.mongodb.com/api/admin/v3.0/auth/profile';

const hexStr = '5899445b275d3ebe8f2ab8c0';

describe('RealmAdminClient', () => {
  const test = new RealmMongoFixture();

  beforeAll(() => test.setup());
  afterAll(() => test.teardown());

  let th;

  beforeEach(async () => {
    const { apiKey, groupId, serverUrl } = extractTestFixtureDataPoints(test);
    th = await buildAdminTestHarness(true, apiKey, groupId, serverUrl);
    await th.configureUserpass();
    await th.createUser();
  });

  afterEach(async () => th.cleanup());

  it('should set the auth.requestOrigin field to what is specified in the options on create', async () => {
    const client = new RealmAdminClient(th.serverUrl, {
      requestOrigin: 'mongodb-baas-ui',
    });
    expect(client.auth.requestOrigin).toEqual('mongodb-baas-ui');
  });
});

function mockApiResponse(options: { [key: string]: any } = {}) {
  const headers = {};
  let body = 'null';
  if (options.body) {
    headers['Content-type'] = 'application/json';
    body = JSON.stringify(options.body);
  }

  const responseOptions = { status: 200, headers, ...options };
  return new Response(body, responseOptions);
}

import Global = NodeJS.Global;
export interface MockGlobal extends Global {
  document: Document;
  window: Window;
  navigator: Navigator;
  fetch: any;
}
declare const global: MockGlobal;

global.Buffer = global.Buffer || require('buffer').Buffer;

describe('Auth login semantics', () => {
  const test = new RealmMongoFixture();
  let client;
  let apiKeySecret;

  beforeAll(async () => test.setup());
  afterAll(async () => test.teardown());

  beforeEach(async () => {
    const { apiKey, serverUrl } = extractTestFixtureDataPoints(test);
    apiKeySecret = apiKey;
    client = new RealmAdminClient(serverUrl);
    await client.logout();
  });

  it('should not be authenticated before log in', async () => {
    expect(client.isAuthenticated()).toEqual(false);
    await client.authenticate(AuthProviderType.APIKey, apiKeySecret);
    expect(client.isAuthenticated()).toEqual(true);
  });
});

describe('Auth', () => {
  const test: { [key: string]: any } = {};

  beforeEach(() => {
    test.prevFetch = window.fetch;
    test.fetch = sinon.stubObject(window, ['fetch']).fetch;
    global.fetch = test.fetch;
    window.fetch = test.fetch;
  });

  afterEach(() => {
    window.fetch = test.prevFetch;
    global.fetch = test.prevFetch;
  });

  it('should return a promise for login with only new auth data userId', async () => {
    test.fetch.returns(
      Promise.resolve(
        mockApiResponse({
          body: {
            access_token: 'fake-access-token',
            refresh_token: 'fake-refresh-token',
            user_id: 'fake-user-id',
            device_id: 'fake-device-id',
          },
        })
      )
    );
    expect.assertions(1);

    const client = new RealmAdminClient();

    expect(
      await client.authenticate(AuthProviderType.Userpass, {
        username: 'email',
        password: 'password',
      })
    ).toEqual('fake-user-id');
  });

  it('should fail trying to do an authed action', async () => {
    expect.assertions(1);

    const client = new RealmAdminClient();
    client.auth.clear();
    await expect(client.apps('foo').list()).rejects.toEqual(new RealmError('Must auth first', ErrUnauthorized));
  });
});

describe('http error responses', () => {
  const testErrMsg = 'test: bad request';
  const testErrCode = 'TestBadRequest';
  describe('JSON error responses are handled correctly', () => {
    beforeEach(() => {
      fetchMock.restore();
      global.fetch = fetchMock;
      fetchMock.delete(SESSION_URL, 204);
      fetchMock.get(LIST_APPS_URL, () => ({
        body: { error: testErrMsg, error_code: testErrCode },
        headers: { 'Content-Type': JSONTYPE },
        status: 400,
      }));
      fetchMock.post(LOCALAUTH_URL, { user_id: hexStr });
    });
    afterEach(() => {
      delete global.fetch;
    });

    it('should return a RealmError instance with the error and error_code extracted', async (done) => {
      const testClient = new RealmAdminClient();
      return testClient
        .authenticate(AuthProviderType.Userpass, {
          username: 'user',
          password: 'password',
        })
        .then(() => testClient.apps('foo').list())
        .catch((e) => {
          // This is actually a RealmError, but because there are quirks with
          // transpiling a class that subclasses Error, we can only really
          // check for instanceof Error here.
          expect(e).toBeInstanceOf(Error);
          expect(e.code).toEqual(testErrCode);
          expect(e.message).toEqual(testErrMsg);
          done();
        });
    });
  });
});

describe('api key auth/logout', () => {
  const validAPIKeys = ['valid-api-key'];
  beforeEach(() => {
    let count = 0;
    fetchMock.restore();
    fetchMock.delete(SESSION_URL, 204);
    fetchMock.post(APIKEY_AUTH_URL, (_, opts) => {
      if (opts.body && (opts.body as string) && validAPIKeys.indexOf(JSON.parse(opts.body as string).key) >= 0) {
        return {
          user_id: hexStr,
        };
      }

      return {
        body: { error: 'unauthorized', error_code: 'unauthorized' },
        headers: { 'Content-Type': JSONTYPE },
        status: 401,
      };
    });

    fetchMock.get(LIST_APPS_URL, () => ({
      body: [
        {
          _id: `${++count}`,
          name: 'foo',
          client_app_id: 'woof',
          location: 'US-VA',
          deployment_model: 'GLOBAL',
          domain_id: 'blah',
          group_id: 'woo',
          last_used: 0,
          last_modified: 0,
        },
      ],
      headers: { 'Content-Type': JSONTYPE },
      status: 200,
    }));
  });

  it('can authenticate with a valid api key', async () => {
    expect.assertions(2);
    const testClient = new RealmAdminClient();
    return testClient
      .authenticate(AuthProviderType.APIKey, 'valid-api-key')
      .then(async () => expect(testClient.authedId()).toEqual(hexStr))
      .then(() => testClient.apps('foo').list())
      .then((response) => {
        expect(response[0].id).toEqual('1');
      });
  });

  it('gets a rejected promise if using an invalid API key', async (done) => {
    expect.assertions(3);
    const testClient = new RealmAdminClient();
    return testClient
      .authenticate(AuthProviderType.APIKey, 'INVALID_KEY')
      .then(() => {
        done('Error should have been thrown, but was not');
      })
      .catch((e) => {
        expect(e).toBeInstanceOf(Error);
        expect(e.response.status).toBe(401);
        expect(e.message).toBe('unauthorized');
        done();
      });
  });
});

const groupId = '5c018152c7e793e2d9d3ef74';

const sampleProfile = new UserProfile({
  userId: '8a15d6d20584297fa336becf',
  domainId: '8a156a044fdd1fa5045accab',
  identities: [
    {
      id: '8a15d6d20584297fa336bece-gkyglweqvueqoypkwanpaaca',
      providerType: AuthProviderType.Anonymous,
      providerId: '8a156a5b0584299f47a1c6fd',
    },
  ],
  data: {},
  type: UserType.Normal,
  roles: [
    { roleName: 'groupOwner', groupId },
    { roleName: 'GROUP_OWNER', groupId },
  ],
});

let prevLocalStorage;

const mockBrowserHarness = {
  setup() {
    const mb = new mocks.MockBrowser();
    prevLocalStorage = global.window.localStorage;
    Object.defineProperty(global.window, 'localStorage', {
      value: mb.getLocalStorage(),
      configurable: true,
    });
  },

  teardown() {
    global.window.localStorage.clear();
    Object.defineProperty(global.window, 'localStorage', {
      value: prevLocalStorage,
      configurable: true,
    });
  },
};

const envConfigs = [
  {
    name: 'with window.localStorage',
    setup: mockBrowserHarness.setup,
    teardown: mockBrowserHarness.teardown,
    storageType: 'localStorage',
  },
  {
    name: 'without window.localStorage',
    setup: () => {},
    teardown: () => {},
    storageType: 'memory',
  },
];

describe('login/logout', () => {
  for (let i = 0; i < envConfigs.length; i++) {
    const envConfig = envConfigs[i];
    describe(envConfig.name, () => {
      const testOriginalRefreshToken = 'original-refresh-token';
      const testOriginalAccessToken = 'original-access-token';
      let validAccessTokens = [testOriginalAccessToken];
      let count = 0;
      beforeEach(() => {
        fetchMock.restore();
        fetchMock.get(PROFILE_URL, {
          body: jsonConvert.serializeObject(sampleProfile),
          headers: { 'Content-Type': JSONTYPE },
          status: 200,
        });
        fetchMock.delete(SESSION_URL, 204);
        fetchMock.post(LOCALAUTH_URL, {
          user_id: hexStr,
          refresh_token: testOriginalRefreshToken,
          access_token: testOriginalAccessToken,
        });

        fetchMock.get(LIST_APPS_URL, (url, opts) => {
          if (!opts.headers || !(opts.headers as Record<string, string>)) {
            return {
              body: { error: 'invalid session', error_code: 'InvalidSession' },
              headers: { 'Content-Type': JSONTYPE },
              status: 401,
            };
          }
          const headers = opts.headers as Record<string, string>;
          const providedToken = headers.Authorization.split(' ')[1];
          if (validAccessTokens.indexOf(providedToken) >= 0) {
            // provided access token is valid
            return {
              body: [
                {
                  _id: `${++count}`,
                  name: 'foo',
                  client_app_id: 'woof',
                  location: 'US-VA',
                  deployment_model: 'GLOBAL',
                  domain_id: 'blah',
                  group_id: 'woo',
                  last_used: 0,
                  last_modified: 0,
                },
              ],
              headers: { 'Content-Type': JSONTYPE },
              status: 200,
            };
          }

          return {
            body: { error: 'invalid session', error_code: 'InvalidSession' },
            headers: { 'Content-Type': JSONTYPE },
            status: 401,
          };
        });

        fetchMock.post(SESSION_URL, () => {
          const accessToken = Math.random().toString(36).substring(7);
          validAccessTokens.push(accessToken);
          return { access_token: accessToken };
        });
      });

      it('stores the refresh token after logging in', async () => {
        expect.assertions(3);
        const testClient = new RealmAdminClient();
        return testClient
          .authenticate(AuthProviderType.Userpass, {
            username: 'user',
            password: 'password',
          })
          .then(async () => {
            const storedToken = await testClient.auth.storage.get(REFRESH_TOKEN_KEY);
            expect(storedToken).toEqual(testOriginalRefreshToken);
            expect(await testClient.auth.getAccessToken()).toEqual(testOriginalAccessToken);
            expect(testClient.authedId()).toEqual(hexStr);
          });
      });

      it('can get a user profile', async () => {
        const testClient = new RealmAdminClient();
        return testClient
          .authenticate(AuthProviderType.Userpass, {
            username: 'user',
            password: 'password',
          })
          .then(() => testClient.userProfile())
          .then((response) => {
            expect(response).toEqual(sampleProfile);
          });
      });

      it('fetches a new access token if InvalidSession is received', async () => {
        expect.assertions(4);
        const testClient = new RealmAdminClient();
        return testClient
          .authenticate(AuthProviderType.Userpass, {
            username: 'user',
            password: 'password',
          })
          .then(() => testClient.apps('foo').list())
          .then((response) => {
            // first request (token is still valid) should yield the response we expect
            expect(response[0].id).toEqual('1');
          })
          .then(() => {
            // invalidate the access token. This forces the client to exchange for a new one.
            validAccessTokens = [];
            return testClient.apps('foo').list();
          })
          .then((response) => {
            expect(response[0].id).toEqual('2');
          })
          .then(async () => {
            expect(testClient.auth.getAccessToken()).toEqual(validAccessTokens[0]);
          })
          .then(async () => {
            await testClient.auth.clear();
            expect(testClient.authedId()).toBeFalsy();
          });
      });
    });
  }
});

describe('token refresh', () => {
  // access token with 5138-Nov-16 expiration
  const testUnexpiredAccessToken =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoidGVzdC1hY2Nlc3MtdG9rZW4iLCJleHAiOjEwMDAwMDAwMDAwMH0.KMAoJOX8Dh9wvt-XzrUN_W6fnypsPrlu4e-AOyqSAGw';

  // acesss token with 1970-Jan-01 expiration
  const testExpiredAccessToken =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoidGVzdC1hY2Nlc3MtdG9rZW4iLCJleHAiOjF9.7tOdF0LXC_2iQMjNfZvQwwfLNiEj-dd0VT0adP5bpjo';

  const validAccessTokens = [testUnexpiredAccessToken];
  let count = 0;
  let refreshCount = 0;

  beforeEach(() => {
    fetchMock.restore();

    fetchMock.get(LIST_APPS_URL, (url, opts) => {
      if (!opts.headers || !(opts.headers as Record<string, string>)) {
        return {
          body: { error: 'invalid session', error_code: 'InvalidSession' },
          headers: { 'Content-Type': JSONTYPE },
          status: 401,
        };
      }

      const headers = opts.headers as Record<string, string>;
      const providedToken = headers.Authorization.split(' ')[1];
      if (validAccessTokens.indexOf(providedToken) >= 0) {
        // provided access token is valid
        return {
          body: [
            {
              _id: `${++count}`,
              name: 'foo',
              client_app_id: 'woof',
              location: 'US-VA',
              deployment_model: 'GLOBAL',
              domain_id: 'blah',
              group_id: 'woo',
              last_used: 0,
              last_modified: 0,
            },
          ],
          headers: { 'Content-Type': JSONTYPE },
          status: 200,
        };
      }

      return {
        body: { error: 'invalid session', error_code: 'InvalidSession' },
        headers: { 'Content-Type': JSONTYPE },
        status: 401,
      };
    });

    count = 0;
    refreshCount = 0;

    fetchMock.post(SESSION_URL, () => {
      ++refreshCount;
      return { access_token: testUnexpiredAccessToken };
    });
    fetchMock.delete(SESSION_URL, 204);
  });

  it('fetches a new access token if the remote server says the stored token is expired', async () => {
    expect.assertions(5);

    fetchMock.post(LOCALAUTH_URL, {
      user_id: hexStr,
      refresh_token: 'refresh-token',
      access_token: testExpiredAccessToken,
    });

    const testClient = new RealmAdminClient();
    return testClient
      .authenticate(AuthProviderType.Userpass, {
        username: 'user',
        password: 'password',
      })
      .then(() => {
        // make sure we are starting with the expired access token
        expect(testClient.auth.getAccessToken()).toEqual(testExpiredAccessToken);
        return testClient.apps('foo').list();
      })
      .then((response) => {
        // token was expired, though it should yield the response we expect without throwing InvalidSession
        expect(response[0].id).toEqual('1');
      })
      .then(async () => {
        // make sure token was updated
        expect(refreshCount).toEqual(1);
        expect(testClient.auth.getAccessToken()).toEqual(testUnexpiredAccessToken);
      })
      .then(async () => {
        await testClient.auth.clear();
        expect(testClient.authedId()).toBeFalsy();
      });
  });

  it('does not fetch a new access token if the locally stored token is not expired/expiring', async () => {
    expect.assertions(5);

    fetchMock.post(LOCALAUTH_URL, {
      user_id: hexStr,
      refresh_token: 'refresh-token',
      access_token: testUnexpiredAccessToken,
    });

    const testClient = new RealmAdminClient();
    return testClient
      .authenticate(AuthProviderType.Userpass, {
        username: 'user',
        password: 'password',
      })
      .then(async () => {
        // make sure we are starting with the unexpired access token
        expect(testClient.auth.getAccessToken()).toEqual(testUnexpiredAccessToken);
        return testClient.apps('foo').list();
      })
      .then((response) => {
        expect(response[0].id).toEqual('1');
      })
      .then(async () => {
        // make sure token was not updated
        expect(refreshCount).toEqual(0);
        expect(testClient.auth.getAccessToken()).toEqual(testUnexpiredAccessToken);
      })
      .then(async () => {
        await testClient.auth.clear();
        expect(testClient.authedId()).toBeFalsy();
      });
  });
});

describe('client options', () => {
  beforeEach(() => {
    fetchMock.restore();
    fetchMock.delete(SESSION_URL, 204);
    fetchMock.post('https://realm.mongodb.com/api/admin/v3.0/auth/providers/local-userpass/login', { user_id: hexStr });
    fetchMock.get(LIST_APPS_URL, () => ({
      body: [
        {
          _id: '1',
          name: 'foo',
          client_app_id: 'woof',
          location: 'US-VA',
          deployment_model: 'GLOBAL',
          domain_id: 'blah',
          group_id: 'woo',
          last_used: 0,
          last_modified: 0,
        },
        {
          _id: '2',
          name: 'foo',
          client_app_id: 'woof',
          location: 'US-VA',
          deployment_model: 'GLOBAL',
          domain_id: 'blah',
          group_id: 'woo',
          last_used: 0,
          last_modified: 0,
        },
        {
          _id: '3',
          name: 'foo',
          client_app_id: 'woof',
          location: 'US-VA',
          deployment_model: 'GLOBAL',
          domain_id: 'blah',
          group_id: 'woo',
          last_used: 0,
          last_modified: 0,
        },
      ],
      headers: { 'Content-Type': JSONTYPE },
      status: 200,
    }));
    fetchMock.delete(SESSION_URL, 204, { overwriteRoutes: false });
  });

  it('allows overriding the base url', async () => {
    const testClient = new RealmAdminClient('https://realm.mongodb.com');
    expect.assertions(1);
    const app1 = Object.assign(new PartialApp(), {
      id: '1',
      name: 'foo',
      clientAppId: 'woof',
      location: 'US-VA',
      deploymentModel: 'GLOBAL',
      domainId: 'blah',
      groupId: 'woo',
    });
    const app2 = Object.assign(new PartialApp(), {
      id: '2',
      name: 'foo',
      clientAppId: 'woof',
      location: 'US-VA',
      deploymentModel: 'GLOBAL',
      domainId: 'blah',
      groupId: 'woo',
    });
    const app3 = Object.assign(new PartialApp(), {
      id: '3',
      name: 'foo',
      clientAppId: 'woof',
      location: 'US-VA',
      deploymentModel: 'GLOBAL',
      domainId: 'blah',
      groupId: 'woo',
    });
    return testClient
      .authenticate(AuthProviderType.Userpass, {
        username: 'user',
        password: 'password',
      })
      .then(() => testClient.apps('foo').list())
      .then((response) => {
        expect(response).toEqual([app1, app2, app3]);
      });
  });

  it('returns a rejected promise if trying to list apps without auth', async (done) => {
    const testClient = new RealmAdminClient();
    testClient
      .logout()
      .then(() => testClient.apps('foo').list())
      .then(() => {
        done(new Error('Error should have been triggered, but was not'));
      })
      .catch(() => {
        done();
      });
  });
});
