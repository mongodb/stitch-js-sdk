const StitchMongoFixture = require('../fixtures/stitch_mongo_fixture');

import { buildAdminTestHarness, extractTestFixtureDataPoints } from '../testutil';

describe('API Keys', () => {
  let test = new StitchMongoFixture();
  let th;
  let apiKeys;

  beforeAll(() => test.setup());
  afterAll(() => test.teardown());

  beforeEach(async() => {
    const { apiKey, groupId, serverUrl } = extractTestFixtureDataPoints(test);
    th = await buildAdminTestHarness(true, apiKey, groupId, serverUrl);

    apiKeys = th.app().apiKeys();

    // enable api key auth provider
    let providers = await th.app().authProviders().list();
    await th.app().authProviders().authProvider(providers[0]._id).enable();
  });

  afterEach(async() => th.cleanup());

  it('listing api keys should return empty list', async() => {
    expect.assertions(1);

    let keys = await apiKeys.list();
    expect(keys).toEqual([]);
  });

  it('creating api keys should work', async() => {
    expect.assertions(3);

    let newKey = await apiKeys.create({ name: 'apiKey' });
    expect(newKey.name).toEqual('apiKey');
    let keys = await apiKeys.list();
    expect(keys).toHaveLength(1);
    expect(keys[0].name).toEqual(newKey.name);
  });

  it('invalid create requests should fail', async() => {
    expect.assertions(1);

    await expect(apiKeys.create({ name: '' })).rejects.toBeDefined();
  });

  it('fetching api key should work', async() => {
    expect.assertions(2);

    let newKey = await apiKeys.create({ name: 'apiKey' });
    expect(newKey.name).toEqual('apiKey');
    let key = await apiKeys.apiKey(newKey._id).get();
    expect(key.name).toEqual(newKey.name);
  });

  it('deleting api key should work', async() => {
    expect.assertions(2);

    let newKey = await apiKeys.create({ name: 'apiKey' });
    let keys = await apiKeys.list();
    expect(keys).toHaveLength(1);
    await apiKeys.apiKey(newKey._id).remove();
    keys = await apiKeys.list();
    expect(keys).toHaveLength(0);
  });

  it('enabling/disabling api key should work', async() => {
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
