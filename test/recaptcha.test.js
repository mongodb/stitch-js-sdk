import fetch from 'jest-fetch-mock';
import { StitchAdminClientFactory } from '../src/admin';

describe('Recaptcha', () => {
  const token = 'my-little-token';

  beforeAll(async() => {
    global['fetch'] = fetch;
    fetch.mockResponseOnce(Promise.resolve());
    let adminClient = await StitchAdminClientFactory.create();
    await adminClient.verifyRecaptcha(token);
  });

  afterAll(() => fetch.resetMocks());

  it('should be verified with cors enabled', () => {
    expect(fetch.mock.calls.length).toEqual(1);
    expect(fetch.mock.calls[0][1].cors).toBeTruthy();
  });

  it('should allow cookies to be sent with the request', () => {
    expect(fetch.mock.calls.length).toEqual(1);
    expect(fetch.mock.calls[0][1].credentials).toEqual('include');
  });

  it('should use URLSearchParams to submit token', () => {
    expect(fetch.mock.calls.length).toEqual(1);
    expect(fetch.mock.calls[0][1].body).toBeInstanceOf(URLSearchParams);
  });

  it('should let the request determine the Content Type', () => {
    expect(fetch.mock.calls.length).toEqual(1);
    expect(fetch.mock.calls[0][1].headers['Content-Type']).toBeUndefined();
  });

  it('should not require Stitch specific header', () => {
    expect(fetch.mock.calls.length).toEqual(1);
    expect(fetch.mock.calls[0][1].headers['X-STITCH-Request-Origin']).toBeUndefined();
  });
});
