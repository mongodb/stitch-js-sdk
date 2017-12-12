/* global expect, it, describe, global, afterEach, beforeEach, afterAll, beforeAll, require, Buffer, Promise */
const fetchMock = require('fetch-mock');
const URL = require('url-parse');
import StitchClient from '../../src/client';
import { JSONTYPE, DEFAULT_STITCH_SERVER_URL } from '../../src/common';
import { REFRESH_TOKEN_KEY } from '../../src/auth/common';
import Auth from '../../src/auth';
import { mocks } from 'mock-browser';
import ExtJSON from 'mongodb-extjson';

const ANON_AUTH_URL = 'https://stitch.mongodb.com/api/client/v2.0/app/testapp/auth/providers/anon-user/login';
const APIKEY_AUTH_URL = 'https://stitch.mongodb.com/api/client/v2.0/app/testapp/auth/providers/api-key/login';
const LOCALAUTH_URL = 'https://stitch.mongodb.com/api/client/v2.0/app/testapp/auth/providers/local-userpass/login';
const CUSTOM_AUTH_URL = 'https://stitch.mongodb.com/api/client/v2.0/app/testapp/auth/providers/custom-token/login';

const FUNCTION_CALL_URL = 'https://stitch.mongodb.com/api/client/v2.0/app/testapp/functions/call';
const USERKEYS_API_URL = 'https://stitch.mongodb.com/api/client/v2.0/app/testapp/auth/me/api_keys';

const MockBrowser = mocks.MockBrowser;
global.Buffer = global.Buffer || require('buffer').Buffer;

const hexStr = '5899445b275d3ebe8f2ab8c0';
const mockDeviceId = '8773934448abcdef12345678';

const sampleProfile = {
  user_id: '8a15d6d20584297fa336becf',
  domain_id: '8a156a044fdd1fa5045accab',
  identities:
  [
    {
      id: '8a15d6d20584297fa336bece-gkyglweqvueqoypkwanpaaca',
      provider_type: 'anon-user',
      provider_id: '8a156a5b0584299f47a1c6fd'
    }
  ],
  data: {},
  type: 'normal'
};

describe('api key auth/logout', () => {
  let validAPIKeys = ['valid-api-key'];
  beforeEach(() => {
    let count = 0;
    fetchMock.restore();
    fetchMock.post(APIKEY_AUTH_URL, (url, opts) => {
      if (validAPIKeys.indexOf(JSON.parse(opts.body).key) >= 0) {
        return {
          user_id: hexStr
        };
      }
      return {
        body: {error: 'unauthorized', error_code: 'unauthorized'},
        headers: { 'Content-Type': JSONTYPE },
        status: 401
      };
    });
    fetchMock.get(USERKEYS_API_URL, () => {
      return {"a": "asdfasdf"}
    });
  });


  it('can get a userkey', () => {
    let testClient = new StitchClient('testapp');
    return testClient.authenticate('apiKey', 'valid-api-key')
      .then(() => testClient.getUserApiKeys())
      .then(response => {
        expect(response).toEqual(sampleProfile);
      });
  });



});


