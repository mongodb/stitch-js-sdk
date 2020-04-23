import { AuthProviderType } from '../src/api/v3/AuthProviders';
import Auth from '../src/auth';
import RealmAdminClient from '../src/Client';
import { DEFAULT_REALM_SERVER_URL, JSONTYPE } from '../src/Common';

import fetchMock from 'fetch-mock';
import { mocks } from 'mock-browser';

const SESSION_URL = 'https://realm.mongodb.com/api/admin/v3.0/auth/session';

const hexStr = '5899445b275d3ebe8f2ab8c0';

import Global = NodeJS.Global;
export interface MockGlobal extends Global {
  document: Document;
  window: Window;
  navigator: Navigator;
  fetch: any;
}
declare const global: MockGlobal;

global.Buffer = global.Buffer || require('buffer').Buffer;

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

describe('Auth', () => {
  const validUsernames = ['user'];
  const checkLogin = (url, opts) => {
    const args = JSON.parse(opts.body);

    if (validUsernames.indexOf(args.username) >= 0) {
      return {
        user_id: hexStr,
      };
    }

    let body: Record<string, any> | string = {
      error: 'unauthorized',
      error_code: 'unauthorized',
    };
    let type = JSONTYPE;
    let status = 401;
    if (args.username === 'html') {
      body = '<html><head><title>Error</title></head><body>Error</body></html>';
      type = 'text/html';
      status = 500;
    }

    return {
      body,
      headers: { 'Content-Type': type },
      status,
    };
  };
  for (let i = 0; i < envConfigs.length; i++) {
    const envConfig = envConfigs[i];
    const options = { storageType: envConfig.storageType };

    describe(envConfig.name, () => {
      beforeEach(() => {
        global.fetch = fetchMock;
        envConfig.setup();
        fetchMock.post('/auth/providers/local-userpass/login', checkLogin);
        fetchMock.post(`${DEFAULT_REALM_SERVER_URL}/api/admin/v3.0/auth/providers/local-userpass/login`, checkLogin);
        fetchMock.delete(SESSION_URL, 204);
      });

      afterEach(() => {
        envConfig.teardown();
        fetchMock.restore();
        delete global.fetch;
      });

      const testClient = new RealmAdminClient();

      it('get() set() clear() authedId should work', async () => {
        expect.assertions(4);
        const a = new Auth(testClient, '/auth', options);
        expect(a._get()).toEqual({});

        const testUser = { access_token: 'bar', user_id: hexStr };
        a.set(testUser);
        expect(a._get()).toEqual({ accessToken: 'bar', userId: hexStr });
        expect(a.authedId).toEqual(hexStr);

        a.clear();
        expect(a._get()).toEqual({});
      });

      it('should local auth successfully', async () => {
        expect.assertions(1);
        const a = new Auth(testClient, '/auth', options);
        return a
          .provider(AuthProviderType.Userpass)
          .authenticate({ username: 'user', password: 'password' })
          .then(() => expect(a.authedId).toEqual(hexStr));
      });

      it('should have an error if local auth is unsuccessful', async (done) => {
        expect.assertions(4);
        const a = new Auth(testClient, '/auth', options);
        return a
          .provider(AuthProviderType.Userpass)
          .authenticate({ username: 'fake-user', password: 'password' })
          .then(() => done('expected an error on unsuccessful login'))
          .catch((e) => {
            expect(e).toBeInstanceOf(Error);
            expect(e.response.status).toBe(401);
            expect(e.message).toBe('unauthorized');
            expect(e.code).toBe('unauthorized');
            done();
          });
      });

      it('should have an error if server returns non-JSON', async (done) => {
        expect.assertions(3);
        const a = new Auth(testClient, '/auth', options);
        return a
          .provider(AuthProviderType.Userpass)
          .authenticate({ username: 'html', password: 'password' })
          .then(() => done('expected an error on unsuccessful login'))
          .catch((e) => {
            expect(e).toBeInstanceOf(Error);
            expect(e.response.status).toBe(500);
            expect(e.message).toBe('Internal Server Error');
            done();
          });
      });

      it('should allow setting access tokens', async () => {
        expect.assertions(3);
        const auth = new Auth(testClient, '/auth', options);
        return auth
          .provider(AuthProviderType.Userpass)
          .authenticate({ username: 'user', password: 'password' })
          .then(() => {
            expect(auth.authedId).toEqual(hexStr);
            expect(auth.getAccessToken()).toBeUndefined();
            auth.set({ access_token: 'foo' });
            expect(auth.getAccessToken()).toEqual('foo');
          });
      });

      it('should be able to access auth methods from client', async () => {
        expect.assertions(4);
        return testClient
          .authenticate(AuthProviderType.Userpass, {
            username: 'user',
            password: 'password',
          })
          .then(() => {
            expect(testClient.authedId()).toEqual(hexStr);
            expect(testClient.authError()).toBeFalsy();
          })
          .then(() => testClient.logout())
          .then(() => {
            expect(testClient.authedId()).toBeFalsy();
            expect(testClient.authError()).toBeFalsy();
          });
      });
    });
  }
});
