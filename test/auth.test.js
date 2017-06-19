const sinon = require('sinon');
const { StitchClient } = require('../src/client');
const common = require('../src/common');

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

let test = {};
describe('Auth', function() {
  beforeEach(() => { test.fetch = sinon.stub(window, 'fetch'); });
  afterEach(() => test.fetch.restore());

  it('should allow the user to retrieve profile information', () => {
    window.fetch.resolves(mockApiResponse());
    let client = new StitchClient();
    return client.login()
      .then(() => {
        // console.log(test.fetch.getCall(0).args);
      });
  });

  it('should return a promise for anonymous login with existing auth data', () => {
    window.fetch.resolves(mockApiResponse());
    let client = new StitchClient();
    client.auth.storage.set(common.USER_AUTH_KEY, mockAuthData());

    return client.login()
      .then(data => {
        expect(data).toEqual({
          accessToken: 'fake-access-token',
          refreshToken: 'fake-refresh-token',
          userId: 'fake-user-id',
          deviceId: 'fake-device-id'
        });
      });
  });
});
