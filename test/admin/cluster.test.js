import fetch from 'jest-fetch-mock';
import sinon from 'sinon';
import { StitchAdminClientFactory } from '../../src/admin';

describe('Clusters', () => {
  const groupId = 'my-group-id';
  const appId = 'my-app-id';
  const regionName = 'IT1';

  beforeAll(async () => {
    global['fetch'] = fetch;
    fetch.mockResponseOnce(Promise.resolve());
    let adminClient = await StitchAdminClientFactory.create();
    adminClient.isAuthenticated = sinon.stub().returns(true);

    await adminClient.privateClusters(groupId, appId).create(regionName);
  });

  afterAll(() => fetch.resetMocks());

  it('should always include groupID and appID in the request URL', () => {
    expect(fetch.mock.calls.length).toEqual(1);
    expect(fetch.mock.calls[0][0]).toContain(groupId);
    expect(fetch.mock.calls[0][0]).toContain(appId);
  });

  it('should always specify a region name', () => {
    expect(fetch.mock.calls.length).toEqual(1);
    expect(typeof fetch.mock.calls[0][1].body).toBe('string');
    expect(fetch.mock.calls[0][1].body).toContain('region_name');
    expect(fetch.mock.calls[0][1].body).toContain(regionName);
  });

  it('should allow cookies to be sent with the request', () => {
    expect(fetch.mock.calls.length).toEqual(1);
    expect(fetch.mock.calls[0][1].credentials).toEqual('include');
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
