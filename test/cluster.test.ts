import RealmAdminClient from '../src/Client';

import * as sinon from 'ts-sinon';

import Global = NodeJS.Global;
export interface MockGlobal extends Global {
  document: Document;
  window: Window;
  navigator: Navigator;
  fetch: any;
}
declare const global: MockGlobal;

describe('Clusters', () => {
  const test: { [key: string]: any } = {};
  const groupId = 'my-group-id';
  const appId = 'my-app-id';
  const regionName = 'IT1';

  beforeAll(async () => {
    test.prevFetch = window.fetch;
    test.fetch = sinon.stubObject(window, ['fetch']).fetch;
    global.fetch = test.fetch;
    window.fetch = test.fetch;
    test.fetch.returns(
      Promise.resolve({
        status: 204,
        headers: { get: () => '' },
        text: () => Promise.resolve(`{"cluster_name": "something"}`),
      })
    );
    const adminClient = new RealmAdminClient();
    adminClient.isAuthenticated = () => true;

    await adminClient.private().group(groupId).app(appId).atlasClusters().create(regionName);
  });

  afterAll(() => {
    window.fetch = test.prevFetch;
    global.fetch = test.prevFetch;
  });

  it('should always include groupID and appID in the request URL', () => {
    expect(test.fetch.getCalls().length).toEqual(1);
    expect(test.fetch.getCalls()[0].args[0]).toContain(groupId);
    expect(test.fetch.getCalls()[0].args[0]).toContain(appId);
  });

  it('should always specify a region name', () => {
    expect(test.fetch.getCalls().length).toEqual(1);
    expect(typeof test.fetch.getCalls()[0].args[1].body).toBe('string');
    expect(test.fetch.getCalls()[0].args[1].body).toContain('region_name');
    expect(test.fetch.getCalls()[0].args[1].body).toContain(regionName);
  });

  it('should allow cookies to be sent with the request', () => {
    expect(test.fetch.getCalls().length).toEqual(1);
    expect(test.fetch.getCalls()[0].args[1].credentials).toEqual('include');
  });

  it('should have json as Content Type', () => {
    expect(test.fetch.getCalls().length).toEqual(1);
    expect(test.fetch.getCalls()[0].args[1].headers['Content-Type']).toBe('application/json');
  });

  it('should require Authorization', () => {
    expect(test.fetch.getCalls().length).toEqual(1);
    expect(test.fetch.getCalls()[0].args[1].headers.Authorization).toContain('Bearer');
  });
});
