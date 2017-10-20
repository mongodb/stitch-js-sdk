import sinon from 'sinon';
import StitchClient from '../src/client';
import * as common from '../src/auth/common';

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
describe('Auth', () => {
  beforeEach(() => { test.fetch = sinon.stub(window, 'fetch'); });
  afterEach(() => test.fetch.restore());

  it('should return a promise for anonymous login with existing auth data', () => {
    window.fetch.resolves(mockApiResponse());
    expect.assertions(1);

    let client = new StitchClient();
    client.auth.storage.set(common.USER_AUTH_KEY, mockAuthData());

    return client.login()
      .then(userId => expect(userId).toEqual('fake-user-id'));
  });

  it('should return a promise for login with only new auth data userId', () => {
    window.fetch.resolves(mockApiResponse({
      body: {
        accessToken: 'fake-access-token',
        refreshToken: 'fake-refresh-token',
        userId: 'fake-user-id',
        deviceId: 'fake-device-id'
      }
    }));
    expect.assertions(1);

    let client = new StitchClient();

    return client.login('email', 'password')
      .then(userId => expect(userId).toEqual('fake-user-id'));
  });

  it('should return a promise for login with only existing auth data userId', () => {
    window.fetch.resolves(mockApiResponse());
    expect.assertions(1);

    let client = new StitchClient();
    client.auth.storage.set(common.USER_AUTH_KEY, mockAuthData());

    return client.login('email', 'password')
      .then(userId => expect(userId).toEqual('fake-user-id'));
  });
});
