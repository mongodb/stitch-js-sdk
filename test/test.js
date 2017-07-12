/* global expect, it, describe, global, afterEach, beforeEach, afterAll, beforeAll, require, Buffer, Promise */
const fetchMock = require('fetch-mock');
import { StitchClient } from '../src/client';
import { parseRedirectFragment, JSONTYPE, REFRESH_TOKEN_KEY, DEFAULT_STITCH_SERVER_URL } from '../src/common';
import Auth from '../src/auth';
import { mocks } from 'mock-browser';

const EJSON = require('mongodb-extjson');

const ANON_AUTH_URL = 'https://stitch.mongodb.com/api/client/v1.0/app/testapp/auth/anon/user';
const APIKEY_AUTH_URL = 'https://stitch.mongodb.com/api/client/v1.0/app/testapp/auth/api/key';
const LOCALAUTH_URL = 'https://stitch.mongodb.com/api/client/v1.0/app/testapp/auth/local/userpass';
const PIPELINE_URL = 'https://stitch.mongodb.com/api/client/v1.0/app/testapp/pipeline';
const NEW_ACCESSTOKEN_URL = 'https://stitch.mongodb.com/api/client/v1.0/app/testapp/auth/newAccessToken';
const BASEAUTH_URL = 'https://stitch.mongodb.com/api/client/v1.0/app/testapp/auth';
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

describe('Redirect fragment parsing', () => {
  const makeFragment = (parts) => (
    Object.keys(parts).map(
      (key) => (encodeURIComponent(key) + '=' + parts[key])
    ).join('&')
  );

  it('should detect valid states', () => {
    let result = parseRedirectFragment(makeFragment({'_stitch_state': 'state_XYZ'}), 'state_XYZ');
    expect(result.stateValid).toBe(true);
    expect(result.found).toBe(true);
    expect(result.lastError).toBe(null);
  });

  it('should detect invalid states', () => {
    let result = parseRedirectFragment(makeFragment({'_stitch_state': 'state_XYZ'}), 'state_ABC');
    expect(result.stateValid).toBe(false);
    expect(result.lastError).toBe(null);
  });

  it('should detect errors', () => {
    let result = parseRedirectFragment(makeFragment({'_stitch_error': 'hello world'}), 'state_ABC');
    expect(result.lastError).toEqual('hello world');
    expect(result.stateValid).toBe(false);
  });

  it('should detect if no items found', () => {
    let result = parseRedirectFragment(makeFragment({'foo': 'bar'}), 'state_ABC');
    expect(result.found).toBe(false);
  });

  it('should handle ua redirects', () => {
    let result = parseRedirectFragment(makeFragment({'_stitch_ua': 'somejwt$anotherjwt$userid$deviceid'}), 'state_ABC');
    expect(result.found).toBe(true);
    expect(result.ua).toEqual({
      accessToken: 'somejwt',
      refreshToken: 'anotherjwt',
      userId: 'userid',
      deviceId: 'deviceid'
    });
  });

  it('should gracefully handle invalid ua data', () => {
    let result = parseRedirectFragment(makeFragment({'_stitch_ua': 'invalid'}), 'state_ABC');
    expect(result.found).toBe(false);
    expect(result.ua).toBeNull();
    expect(result.lastError).toBeTruthy();
  });
});

describe('Auth', () => {
  const validUsernames = ['user'];
  const checkLogin = (url, opts) => {
    const args = JSON.parse(opts.body);

    if (validUsernames.indexOf(args.username) >= 0) {
      return {
        userId: hexStr
      };
    }

    let body = {error: 'unauthorized', errorCode: 'unauthorized'};
    let type = JSONTYPE;
    let status = 401;
    if (args.username === 'html') {
      body = '<html><head><title>Error</title></head><body>Error</body></html>';
      type = 'text/html';
      status = 500;
    }

    return {
      body: body,
      headers: { 'Content-Type': type },
      status: status
    };
  };
  for (const envConfig of envConfigs) {
    describe(envConfig.name, () => {
      beforeEach(() => {
        envConfig.setup();
        fetchMock.post('/auth/local/userpass', checkLogin);
        fetchMock.post(DEFAULT_STITCH_SERVER_URL + '/api/client/v1.0/app/testapp/auth/local/userpass', checkLogin);
        fetchMock.delete(DEFAULT_STITCH_SERVER_URL + '/api/client/v1.0/app/testapp/auth', {});
      });

      afterEach(() => {
        envConfig.teardown();
        fetchMock.restore();
      });

      it('get() set() clear() authedId() should work', () => {
        expect.assertions(4);
        const a = new Auth(null, '/auth');
        expect(a.get()).toEqual({});

        const testUser = {'foo': 'bar', 'biz': 'baz', 'userId': hexStr};
        a.set(testUser);
        expect(a.get()).toEqual(testUser);
        expect(a.authedId()).toEqual(hexStr);

        a.clear();
        expect(a.get()).toEqual({});
      });

      it('should local auth successfully', () => {
        expect.assertions(1);
        const a = new Auth(null, '/auth');
        return a.provider('userpass').login('user', 'password')
          .then(() => expect(a.authedId()).toEqual(hexStr));
      });

      it('should have an error if local auth is unsuccessful', (done) => {
        expect.assertions(4);
        const a = new Auth(null, '/auth');
        return a.provider('userpass').login('fake-user', 'password')
          .then(() => done('expected an error on unsuccessful login'))
          .catch(e => {
            expect(e).toBeInstanceOf(Error);
            expect(e.response.status).toBe(401);
            expect(e.error).toBe('unauthorized');
            expect(e.errorCode).toBe('unauthorized');
            done();
          });
      });

      it('should have an error if server returns non-JSON', (done) => {
        expect.assertions(3);
        const a = new Auth(null, '/auth');
        return a.provider('userpass').login('html', 'password')
          .then(() => done('expected an error on unsuccessful login'))
          .catch(e => {
            expect(e).toBeInstanceOf(Error);
            expect(e.response.status).toBe(500);
            expect(e.error).toBe('Internal Server Error');
            done();
          });
      });

      it('should allow setting access tokens', () => {
        expect.assertions(3);
        const auth = new Auth(null, '/auth');
        return auth.provider('userpass').login('user', 'password')
          .then(() => {
            expect(auth.authedId()).toEqual(hexStr);
            expect(auth.getAccessToken()).toBeUndefined();
            auth.setAccessToken('foo');
            expect(auth.getAccessToken()).toEqual('foo');
          });
      });

      it('should be able to access auth methods from client', () => {
        expect.assertions(4);
        let testClient = new StitchClient('testapp');
        return testClient.login('user', 'password')
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
      fetchMock.post(LOCALAUTH_URL, {userId: hexStr});
    });

    it('should return a StitchError instance with the error and errorCode extracted', (done) => {
      const testClient = new StitchClient('testapp');
      return testClient.login('user', 'password')
        .then(() => testClient.executePipeline([{action: 'literal', args: {items: [{x: 5}]}}]))
        .catch(e => {
          // This is actually a StitchError, but because there are quirks with
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
      userId: hexStr,
      accessToken: 'test-access-token',
      refreshToken: 'test-refresh-token'
    });

    fetchMock.post(PIPELINE_URL, (url, opts) => {
      return {result: [{x: ++count}]};
    });
  });

  it('can authenticate with anonymous auth method', () => {
    expect.assertions(3);
    let testClient = new StitchClient('testapp');
    return testClient.login()
      .then(() => {
        expect(testClient.auth.getAccessToken()).toEqual('test-access-token');
        expect(testClient.authedId()).toEqual(hexStr);
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
          userId: hexStr
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
    let testClient = new StitchClient('testapp');
    return testClient.authenticate('apiKey', 'valid-api-key')
      .then(() => expect(testClient.authedId()).toEqual(hexStr))
      .then(() => testClient.executePipeline([{action: 'literal', args: {items: [{x: 'foo'}]}}]))
      .then(response => {
        expect(response.result[0].x).toEqual(1);
      });
  });

  it('gets a rejected promise if using an invalid API key', (done) => {
    expect.assertions(3);
    let testClient = new StitchClient('testapp');
    return testClient.authenticate('apiKey', 'INVALID_KEY')
      .then(() => {
        done('Error should have been thrown, but was not');
      })
      .catch(e => {
        expect(e).toBeInstanceOf(Error);
        expect(e.response.status).toBe(401);
        expect(e.error).toBe('unauthorized');
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
        fetchMock.post(LOCALAUTH_URL, {
          userId: hexStr,
          refreshToken: testOriginalRefreshToken,
          accessToken: testOriginalAccessToken
        });

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
        expect.assertions(3);
        let testClient = new StitchClient('testapp');
        return testClient.login('user', 'password')
          .then(() => {
            let storedToken = testClient.auth.storage.get(REFRESH_TOKEN_KEY);
            expect(storedToken).toEqual(testOriginalRefreshToken);
            expect(testClient.auth.getAccessToken()).toEqual(testOriginalAccessToken);
            expect(testClient.authedId()).toEqual(hexStr);
          });
      });

      it('fetches a new access token if InvalidSession is received', () => {
        expect.assertions(4);
        let testClient = new StitchClient('testapp');
        return testClient.login('user', 'password')
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
            expect(testClient.auth.getAccessToken()).toEqual(validAccessTokens[0]);
          })
          .then(() => {
            testClient.auth.storage.clear();
            expect(testClient.authedId()).toBeFalsy();
          });
      });
    });
  }
});


describe('client options', () => {
  beforeEach(() => {
    fetchMock.restore();
    fetchMock.post('https://stitch2.mongodb.com/api/client/v1.0/app/testapp/auth/local/userpass', {userId: hexStr});
    fetchMock.post('https://stitch2.mongodb.com/api/client/v1.0/app/testapp/pipeline', (url, opts) => {
      return {result: [{x: {'$oid': hexStr}}]};
    });
    fetchMock.delete(BASEAUTH_URL, {});
    fetchMock.post(PIPELINE_URL, {result: [{x: {'$oid': hexStr}}]});
  });

  it('allows overriding the base url', () => {
    let testClient = new StitchClient('testapp', {baseUrl: 'https://stitch2.mongodb.com'});
    expect.assertions(1);
    return testClient.login('user', 'password')
      .then(() => {
        return testClient.executePipeline([{action: 'literal', args: {items: [{x: {'$oid': hexStr}}]}}]);
      })
      .then((response) => {
        expect(response.result[0].x).toEqual(new ejson.bson.ObjectID(hexStr));
      });
  });

  it('returns a rejected promise if trying to execute a pipeline without auth', (done) => {
    let testClient = new StitchClient('testapp');
    testClient.logout()
      .then(() => testClient.executePipeline([{action: 'literal', args: {items: [{x: {'$oid': hexStr}}]}}]))
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
          fetchMock.post(LOCALAUTH_URL, {userId: '5899445b275d3ebe8f2ab8a6'});
          fetchMock.post(PIPELINE_URL, (url, opts) => {
            let out = JSON.stringify({result: [{x: {'$oid': hexStr}}]});
            return out;
          });
        });

        it('should decode extended json from pipeline responses', () => {
          expect.assertions(1);
          let testClient = new StitchClient('testapp');
          return testClient.login('user', 'password')
            .then(() =>
              testClient.executePipeline([{action: 'literal', args: {items: [{x: {'$oid': hexStr}}]}}]))
            .then((response) => expect(response.result[0].x).toEqual(new ejson.bson.ObjectID(hexStr)));
        });

        it('should allow overriding the decoder implementation', () => {
          expect.assertions(1);
          let testClient = new StitchClient('testapp');
          return testClient.login('user', 'password')
            .then(() => testClient.executePipeline([{action: 'literal', args: {items: [{x: {'$oid': hexStr}}]}}], {decoder: JSON.parse}))
            .then((response) => expect(response.result[0].x).toEqual({'$oid': hexStr}));
        });
      });

      describe('extended json encode (outgoing)', () => {
        let requestOpts;
        beforeAll(() => {
          fetchMock.restore();
          fetchMock.post(LOCALAUTH_URL, {userId: hexStr});
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
          let testClient = new StitchClient('testapp', {baseUrl: ''});
          return testClient.login('user', 'password')
            .then(a => testClient.executePipeline([requestBodyObj]))
            .then(response => expect(JSON.parse(requestOpts.body)).toEqual([requestBodyExtJSON]));
        });
      });
    });
  }
});
