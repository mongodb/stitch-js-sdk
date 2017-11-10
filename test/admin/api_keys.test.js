const StitchMongoFixture = require('../fixtures/stitch_mongo_fixture');

import { getAuthenticatedClient } from '../testutil';

describe('API Keys', () => {
  let test = new StitchMongoFixture();
  let apiKeys;
  let app;
  let apps;
  beforeAll(() => test.setup());
  afterAll(() => test.teardown());
  beforeEach(async () => {
    let adminClient = await getAuthenticatedClient(test.userData.apiKey.key);
    test.groupId = test.userData.group.groupId;
    apps = await adminClient.apps(test.groupId);
    app = await apps.create({ name: 'testname' });
    apiKeys = adminClient
      .apps(test.groupId)
      .app(app._id)
      .apiKeys();

    // enable api key auth provider
    let providers = await adminClient
      .apps(test.groupId)
      .app(app._id)
      .authProviders()
      .list();
    await adminClient
      .apps(test.groupId)
      .app(app._id)
      .authProviders()
      .authProvider(providers[0]._id)
      .enable();
  });
  afterEach(async () => {
    await apps.app(app._id).remove();
  });

  it('listing api keys should return empty list', async () => {
    expect.assertions(1);

    let keys = await apiKeys.list();
    expect(keys).toEqual([]);
  });

  it('creating api keys should work', async () => {
    expect.assertions(3);

    let newKey = await apiKeys.create({ name: 'apiKey' });
    expect(newKey.name).toEqual('apiKey');
    let keys = await apiKeys.list();
    expect(keys).toHaveLength(1);
    expect(keys[0].name).toEqual(newKey.name);
  });

  it('invalid create requests should fail', async () => {
    expect.assertions(1);

    await expect(apiKeys.create({ name: '' })).rejects.toBeDefined();
  });

  it('fetching api key should work', async () => {
    expect.assertions(2);

    let newKey = await apiKeys.create({ name: 'apiKey' });
    expect(newKey.name).toEqual('apiKey');
    let key = await apiKeys.apiKey(newKey._id).get();
    expect(key.name).toEqual(newKey.name);
  });

  it('deleting api key should work', async () => {
    expect.assertions(2);

    let newKey = await apiKeys.create({ name: 'apiKey' });
    let keys = await apiKeys.list();
    expect(keys).toHaveLength(1);
    await apiKeys.apiKey(newKey._id).remove();
    keys = await apiKeys.list();
    expect(keys).toHaveLength(0);
  });

  it('enabling/disabling api key should work', async () => {
    expect.assertions(3);

    let key = await apiKeys.create({ name: 'apiKey' });
    expect(key.disabled).toEqual(false);
    await apiKeys.apiKey(key._id).disable();
    key = await apiKeys.apiKey(key._id).get();
    expect(key.disabled).toEqual(true);
    await apiKeys.apiKey(key._id).enable();
    key = await apiKeys.apiKey(key._id).get();
    expect(key.disabled).toEqual(false);
  });
});
