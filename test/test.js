/* global expect, it, describe, global, afterEach, beforeEach, afterAll, beforeAll, require, Buffer, Promise */
const fetchMock = require('fetch-mock');
import { BaasClient, toQueryString } from '../src/client';
import { parseRedirectFragment, JSONTYPE, REFRESH_TOKEN_KEY, DEFAULT_BAAS_SERVER_URL } from '../src/common';
import Auth from '../src/auth';
import { mocks } from 'mock-browser';

const EJSON = require('mongodb-extjson');

const ANON_AUTH_URL = 'https://baas-dev.10gen.cc/api/client/v1.0/app/testapp/auth/anon/user';
const APIKEY_AUTH_URL = 'https://baas-dev.10gen.cc/api/client/v1.0/app/testapp/auth/api/key';
const LOCALAUTH_URL = 'https://baas-dev.10gen.cc/api/client/v1.0/app/testapp/auth/local/userpass';
const PIPELINE_URL = 'https://baas-dev.10gen.cc/api/client/v1.0/app/testapp/pipeline';
const NEW_ACCESSTOKEN_URL = 'https://baas-dev.10gen.cc/api/client/v1.0/app/testapp/auth/newAccessToken';
const BASEAUTH_URL = 'https://baas-dev.10gen.cc/api/client/v1.0/app/testapp/auth';
const ejson = new EJSON();

const MockBrowser = mocks.MockBrowser;
global.Buffer = global.Buffer || require('buffer').Buffer;

const hexStr = '5899445b275d3ebe8f2ab8c0';

const mockBrowserHarness = {
  setup() {
    const mb = new MockBrowser();
    global.window = mb.getWindow();
  },

  teardown() {
    global.window = undefined;
  }
};

const envConfigs = [
  {
    name: 'with window.localStorage',
    setup: mockBrowserHarness.setup,
    teardown: mockBrowserHarness.teardown
  },
  {
    name: 'without window.localStorage',
    setup: () => {},
    teardown: () => {}
  }
];

describe('query string', () => {
  it('should encode an object to a query string', () => {
    expect(toQueryString({
      'x': 'Hello Günter',
      'y': 'foo'
    })).toEqual('x=Hello%20G%C3%BCnter&y=foo');
  });
});

describe('Redirect fragment parsing', () => {
  const makeFragment = (parts) => (
    Object.keys(parts).map(
      (key) => (encodeURIComponent(key) + '=' + parts[key])
    ).join('&')
  );

  it('should detect valid states', () => {
    let result = parseRedirectFragment(makeFragment({'_baas_state': 'state_XYZ'}), 'state_XYZ');
    expect(result.stateValid).toBe(true);
    expect(result.found).toBe(true);
    expect(result.lastError).toBe(null);
  });

  it('should detect invalid states', () => {
    let result = parseRedirectFragment(makeFragment({'_baas_state': 'state_XYZ'}), 'state_ABC');
    expect(result.stateValid).toBe(false);
    expect(result.lastError).toBe(null);
  });

  it('should detect errors', () => {
    let result = parseRedirectFragment(makeFragment({'_baas_error': 'hello world'}), 'state_ABC');
    expect(result.lastError).toEqual('hello world');
    expect(result.stateValid).toBe(false);
  });

  it('should detect if no items found', () => {
    let result = parseRedirectFragment(makeFragment({'foo': 'bar'}), 'state_ABC');
    expect(result.found).toBe(false);
  });
});

describe('Auth', () => {
  for (const envConfig of envConfigs) {
    describe(envConfig.name, () => {
      beforeEach(() => {
        envConfig.setup();
        fetchMock.post('/auth/local/userpass', {user: {'_id': hexStr}});
        fetchMock.post(DEFAULT_BAAS_SERVER_URL + '/api/client/v1.0/app/testapp/auth/local/userpass', {user: {'_id': hexStr}});
        fetchMock.delete(DEFAULT_BAAS_SERVER_URL + '/api/client/v1.0/app/testapp/auth', {});
      });

      afterEach(() => {
        envConfig.teardown();
        fetchMock.restore();
      });

      it('get() set() clear() authedId() should work', () => {
        expect.assertions(4);
        const a = new Auth('/auth');
        expect(a.get()).toBeNull();

        const testUser = {'foo': 'bar', 'biz': 'baz', 'user': {'_id': hexStr}};
        a.set(testUser);
        expect(a.get()).toEqual(testUser);
        expect(a.authedId()).toEqual({'$oid': hexStr});

        a.clear();
        expect(a.get()).toBeNull();
      });

      it('should local auth successfully', () => {
        expect.assertions(1);
        const a = new Auth('/auth');
        return a.localAuth('user', 'password', true).then(() => {
          expect(a.authedId()).toEqual({'$oid': hexStr});
        });
      });

      it('should allow setting access tokens', () => {
        expect.assertions(3);
        const a = new Auth('/auth');
        return a.localAuth('user', 'password', true).then(() => {
          expect(a.authedId()).toEqual({'$oid': hexStr});
          expect(a.get()['accessToken']).toBeUndefined();
          a.setAccessToken('foo');
          expect(a.get()['accessToken']).toEqual('foo');
        });
      });

      it('should be able to access auth methods from client', () => {
        expect.assertions(6);
        let testClient = new BaasClient('testapp');
        return testClient.authManager.localAuth('user', 'password', true)
        .then(() => {
          expect(testClient.authedId()).toEqual({'$oid': hexStr});
          expect(testClient.authError()).toBeFalsy();
          expect(testClient.auth()).toEqual({user: {_id: hexStr}});
        })
        .then(() => testClient.logout())
        .then(() => {
          expect(testClient.authedId()).toBeFalsy();
          expect(testClient.authError()).toBeFalsy();
          expect(testClient.auth()).toBeNull();
        });
      });
    });
  }
});

describe('http error responses', () => {
  const testErrMsg = 'test: bad request';
  const testErrCode = 'TestBadRequest';
  describe('JSON error responses are handled correctly', () => {
    beforeEach(() => {
      fetchMock.restore();
      fetchMock.post(PIPELINE_URL, () =>
        ({
          body: {error: testErrMsg, errorCode: testErrCode},
          headers: { 'Content-Type': JSONTYPE },
          status: 400
        })
      );
      fetchMock.post(LOCALAUTH_URL, {user: {'_id': hexStr}});
    });

    it('should return a BaasError instance with the error and errorCode extracted', (done) => {
      const testClient = new BaasClient('testapp');
      testClient.authManager.localAuth('user', 'password')
      .then(() => testClient.executePipeline([{action: 'literal', args: {items: [{x: 5}]}}]))
      .catch(e => {
        // This is actually a BaasError, but because there are quirks with
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

describe('anonymous auth', () => {
  beforeEach(() => {
    let count = 0;
    fetchMock.restore();
    fetchMock.mock(ANON_AUTH_URL, {
      user: {'_id': hexStr},
      accessToken: 'test-access-token',
      refreshToken: 'test-refresh-token'
    });

    fetchMock.post(PIPELINE_URL, (url, opts) => {
      return {result: [{x: ++count}]};
    });
  });

  it('can authenticate with anonymous auth method', () => {
    expect.assertions(2);
    let testClient = new BaasClient('testapp');
    return testClient.authManager.anonymousAuth()
      .then(() => {
        expect(testClient.auth()).toEqual({
          accessToken: 'test-access-token',
          user: {_id: hexStr}
        });
      })
      .then(() => testClient.executePipeline([{action: 'literal', args: {items: [{x: 'foo'}]}}]))
      .then(response => {
        expect(response.result[0].x).toEqual(1);
      });
  });
});

describe('api key auth/logout', () => {
  let validAPIKeys = ['valid-api-key'];
  beforeEach(() => {
    let count = 0;
    fetchMock.restore();
    fetchMock.post(APIKEY_AUTH_URL, (url, opts) => {
      if (validAPIKeys.indexOf(JSON.parse(opts.body).key) >= 0) {
        return {
          user: {'_id': hexStr}
        };
      }
      return {
        body: {error: 'unauthorized', errorCode: 'unauthorized'},
        headers: { 'Content-Type': JSONTYPE },
        status: 401
      };
    });

    fetchMock.post(PIPELINE_URL, (url, opts) => {
      return {result: [{x: ++count}]};
    });
  });

  it('can authenticate with a valid api key', () => {
    expect.assertions(2);
    let testClient = new BaasClient('testapp');
    return testClient.authManager.apiKeyAuth('valid-api-key')
      .then(() => {
        expect(testClient.auth()).toEqual({user: {_id: hexStr}});
      })
      .then(() => testClient.executePipeline([{action: 'literal', args: {items: [{x: 'foo'}]}}]))
      .then(response => {
        expect(response.result[0].x).toEqual(1);
      });
  });

  it('gets a rejected promise if using an invalid API key', (done) => {
    expect.assertions(2);
    let testClient = new BaasClient('testapp');
    return testClient.authManager.apiKeyAuth('INVALID_KEY')
      .then(() => {
        done('Error should have been thrown, but was not');
      })
      .catch(e => {
        expect(e).toBeInstanceOf(Error);
        expect(e.response.status).toBe(401);
        done();
      });
  });
});

describe('login/logout', () => {
  for (const envConfig of envConfigs) {
    describe(envConfig.name, () => {
      const testOriginalRefreshToken = 'original-refresh-token';
      const testOriginalAccessToken = 'original-access-token';
      let validAccessTokens = [testOriginalAccessToken];
      let count = 0;
      beforeEach(() => {
        fetchMock.restore();
        fetchMock.post(LOCALAUTH_URL,
          ({
            user: {'_id': hexStr},
            refreshToken: testOriginalRefreshToken,
            accessToken: testOriginalAccessToken
          })
        );

        fetchMock.post(PIPELINE_URL, (url, opts) => {
          const providedToken = opts.headers['Authorization'].split(' ')[1];
          if (validAccessTokens.indexOf(providedToken) >= 0) {
            // provided access token is valid
            return {result: [{x: ++count}]};
          }

          return {
            body: {error: 'invalid session', errorCode: 'InvalidSession'},
            headers: { 'Content-Type': JSONTYPE },
            status: 401
          };
        });

        fetchMock.post(NEW_ACCESSTOKEN_URL, (url, opts) => {
          let accessToken = Math.random().toString(36).substring(7);
          validAccessTokens.push(accessToken);
          return {accessToken};
        });
      });

      it('stores the refresh token after logging in', () => {
        expect.assertions(2);
        let testClient = new BaasClient('testapp');
        return testClient.authManager.localAuth('user', 'password')
          .then(() => {
            let storedToken = testClient.authManager.authDataStorage.get(REFRESH_TOKEN_KEY);
            expect(storedToken).toEqual(testOriginalRefreshToken);
            expect(testClient.auth()).toEqual({user: {_id: hexStr}, accessToken: testOriginalAccessToken});
          });
      });

      it('fetches a new access token if InvalidSession is received', () => {
        expect.assertions(4);
        let testClient = new BaasClient('testapp');
        return testClient.authManager.localAuth('user', 'password')
          .then(() => testClient.executePipeline([{action: 'literal', args: {items: [{x: 'foo'}]}}]))
          .then(response => {
            // first request (token is still valid) should yield the response we expect
            expect(response.result[0].x).toEqual(1);
          })
          .then(() => {
            // invalidate the access token. This forces the client to exchange for a new one.
            validAccessTokens = [];
            return testClient.executePipeline([{action: 'literal', args: {items: [{y: 1000}]}}]);
          })
          .then(response => {
            expect(response.result[0].x).toEqual(2);
          })
          .then(() => {
            expect(testClient.auth().accessToken).toEqual(validAccessTokens[0]);
          })
          .then(() => {
            testClient.authManager.authDataStorage.clear();
            expect(testClient.auth()).toBeNull();
          });
      });
    });
  }
});


describe('client options', () => {
  beforeEach(() => {
    fetchMock.restore();
    fetchMock.post('https://baas-dev2.10gen.cc/api/client/v1.0/app/testapp/auth/local/userpass', {user: {'_id': hexStr}});
    fetchMock.post('https://baas-dev2.10gen.cc/api/client/v1.0/app/testapp/pipeline', (url, opts) => {
      return {result: [{x: {'$oid': hexStr}}]};
    });
    fetchMock.delete(BASEAUTH_URL, {});
    fetchMock.post(PIPELINE_URL, {result: [{x: {'$oid': hexStr}}]});
  });

  it('allows overriding the base url', () => {
    let testClient = new BaasClient('testapp', {baseUrl: 'https://baas-dev2.10gen.cc'});
    expect.assertions(1);
    return testClient.authManager.localAuth('user', 'password', true)
    .then(() => {
      return testClient.executePipeline([{action: 'literal', args: {items: [{x: {'$oid': hexStr}}]}}]);
    })
    .then((response) => {
      expect(response.result[0].x).toEqual(new ejson.bson.ObjectID(hexStr));
    });
  });

  it('returns a rejected promise if trying to execute a pipeline without auth', (done) => {
    let testClient = new BaasClient('testapp');
    return testClient.logout()
    .then(() => {
      return testClient.executePipeline([{action: 'literal', args: {items: [{x: {'$oid': hexStr}}]}}]);
    })
    .then(() => {
      done(new Error('Error should have been triggered, but was not'));
    })
    .catch((e) => {
      done();
    });
  });
});

describe('pipeline execution', () => {
  for (const envConfig of envConfigs) {
    describe(envConfig.name, () => {
      beforeAll(envConfig.setup);
      afterAll(envConfig.teardown);
      describe(envConfig.name + ' extended json decode (incoming)', () => {
        beforeAll(() => {
          fetchMock.restore();
          fetchMock.post(LOCALAUTH_URL, {user: {'_id': '5899445b275d3ebe8f2ab8a6'}});
          fetchMock.post(PIPELINE_URL, (url, opts) => {
            let out = JSON.stringify({result: [{x: {'$oid': hexStr}}]});
            return out;
          });
        });

        it('should decode extended json from pipeline responses', () => {
          expect.assertions(1);
          let testClient = new BaasClient('testapp');
          return testClient.authManager.localAuth('user', 'password', true)
          .then(() => {
            return testClient.executePipeline([{action: 'literal', args: {items: [{x: {'$oid': hexStr}}]}}]);
          })
          .then((response) => {
            return expect(response.result[0].x).toEqual(new ejson.bson.ObjectID(hexStr));
          });
        });

        it('should allow overriding the decoder implementation', () => {
          expect.assertions(1);
          let testClient = new BaasClient('testapp');
          return testClient.authManager.localAuth('user', 'password', true)
          .then(() => {
            return testClient.executePipeline([{action: 'literal', args: {items: [{x: {'$oid': hexStr}}]}}], {decoder: JSON.parse});
          })
          .then((response) => {
            return expect(response.result[0].x).toEqual({'$oid': hexStr});
          });
        });
      });

      describe('extended json encode (outgoing)', () => {
        let requestOpts;
        beforeAll(() => {
          fetchMock.restore();
          fetchMock.post(LOCALAUTH_URL, {user: {'_id': hexStr}});
          fetchMock.post(PIPELINE_URL, (url, opts) => {
            // TODO there should be a better way to capture request payload for
            // using in an assertion without doing this.
            requestOpts = opts;
            return {result: [{x: {'$oid': hexStr}}]};
          });
        });

        it('should encode objects to extended json for outgoing pipeline request body', () => {
          expect.assertions(1);
          let requestBodyObj = {action: 'literal', args: {items: [{x: new ejson.bson.ObjectID(hexStr)}]}};
          let requestBodyExtJSON = {action: 'literal', args: {items: [{x: {'$oid': hexStr}}]}};
          let testClient = new BaasClient('testapp', {baseUrl: ''});
          return testClient.authManager.localAuth('user', 'password', true).then((a) => {
            return testClient.executePipeline([requestBodyObj]);
          })
          .then((response) => {
            return Promise.all([
              expect(JSON.parse(requestOpts.body)).toEqual([requestBodyExtJSON])
            ]);
          });
        });
      });
    });
  }
});
