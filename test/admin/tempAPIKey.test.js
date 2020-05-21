import fetch from 'jest-fetch-mock';
import sinon from 'sinon';
import { StitchAdminClientFactory } from '../../src/admin';

describe('Clusters', () => {
  const desc = 'I love my temp Keys!';

  beforeAll(async() => {
    global['fetch'] = fetch;
    fetch.mockResponseOnce(Promise.resolve());
    let adminClient = await StitchAdminClientFactory.create();
    adminClient.isAuthenticated = sinon.stub().returns(true);

    await adminClient.privateTempAPIKeys().create(desc);
  });

  afterAll(() => fetch.resetMocks());

  it('should always include a desc in the request body', () => {
    expect(fetch.mock.calls.length).toEqual(1);
    expect(fetch.mock.calls[0][1].body).toContain(desc);
  });

  it('should have json as Content Type', () => {
    expect(fetch.mock.calls.length).toEqual(1);
    expect(fetch.mock.calls[0][1].headers['Content-Type']).toBe('application/json');
  });

  it('should require Authorization', () => {
    expect(fetch.mock.calls.length).toEqual(1);
    expect(fetch.mock.calls[0][1].headers['Authorization']).toContain('Bearer');
  });
});
