/* eslint no-loop-func: 0 */
const StitchMongoFixture = require('./fixtures/stitch_mongo_fixture');

import { createStorage, MemoryStorage } from '../src/auth/storage';
import { USER_AUTH_KEY, REFRESH_TOKEN_KEY, DEVICE_ID_KEY, STATE_KEY, USER_LOGGED_IN_PT_KEY } from '../src/auth/common';

import { mocks } from 'mock-browser';
import { StitchClientFactory } from '../src/client';
import { buildClientTestHarness, extractTestFixtureDataPoints } from './testutil';

const MockBrowser = mocks.MockBrowser;

const storageTypes = [ 'localStorage', 'sessionStorage', 'fallback' ];

// for testing purposes only
function _runReverseMigration(toVersion, storage) {
  switch (toVersion) {
  case null:
  case undefined:
    let reverseMigrations = [
      USER_AUTH_KEY,
      REFRESH_TOKEN_KEY,
      DEVICE_ID_KEY,
      STATE_KEY,
      USER_LOGGED_IN_PT_KEY
    ].map(key =>
      Promise.resolve(storage.get(key))
        .then(item => {
          let newKey = key;
          if (key.indexOf(storage.namespace) >= 0) {
            newKey = key.split('.').pop();
          }
          return storage.store.setItem(newKey, item);
        })
        .then(() => storage.store.removeItem(storage._generateKey(key)))
    );
    return Promise.all(reverseMigrations)
      .then(() => storage.store.setItem('__storage_version__', toVersion));
  // in future versions, `case 1:`, `case 2:` and so on
  // could be added to perform similar reverse migrations
  default: break;
  }
}

describe('storage', function() {
  const namespace = 'client-test-app1';

  beforeAll(() => {
    if (!global.window.localStorage || !global.window.sessionStorage) {
      let mock = new MockBrowser();
      global.window.localStorage = mock.getLocalStorage();
      global.window.sessionStorage = mock.getSessionStorage();
    }
  });

  for (const storageType of storageTypes) {
    it(`should save token to ${storageType}`, async() => {
      const storage = createStorage({ storageType });
      await storage.set('token', 'foo');
      expect(await storage.get('token')).toEqual('foo');
    });

    it(`should remove token to ${storageType}`, async() => {
      const storage = createStorage({ storageType });
      await storage.remove('token');
      expect(await storage.get('token')).toBeNull();
    });

    it(`should return key by index for ${storageType}`, async() => {
      const storage = createStorage({ storageType, namespace });
      await storage.set('foo', 42);
      await storage.set('bar', 84);

      expect(storage.store.getItem(storage.store.key(2))).toEqual(84);
      expect(storage.store.getItem(storage.store.key(1))).toEqual(42);
    });

    it(`should allow for two unique clients to coexist for ${storageType}`, async() => {
      const client1 = await StitchClientFactory.create(`test-app1-${storageType}`);
      const client2 = await StitchClientFactory.create(`test-app2-${storageType}`);

      const ogAuth1 = await client1.auth.set({
        'access_token': 'quux',
        'refresh_token': 'corge',
        'device_id': 'uier',
        'user_id': 'grault'
      }, 'anon');

      const ogAuth2 = await client2.auth.set({
        'access_token': 'foo',
        'refresh_token': 'bar',
        'device_id': 'baz',
        'user_id': 'qux'
      }, 'anon');

      const fetchedAuth1 = await client1.auth._get();
      const fetchedAuth2 = await client2.auth._get();

      expect(ogAuth1).toEqual(fetchedAuth1);
      expect(ogAuth2).toEqual(fetchedAuth2);

      expect(fetchedAuth1).not.toEqual(fetchedAuth2);

      await client1.auth.clear();
      expect(await client1.auth._get()).toEqual({});
      expect(await client2.auth._get()).toEqual(fetchedAuth2);
    });

    it(`should reverse migrate for ${storageType}`, async() => {
      const storage = createStorage({storageType, namespace});

      await storage.set(USER_AUTH_KEY, 42);
      await storage.set(REFRESH_TOKEN_KEY, 84);

      expect(await storage.get(USER_AUTH_KEY)).toEqual(42);
      expect(await storage.get(REFRESH_TOKEN_KEY)).toEqual(84);

      expect(storage.store.getItem(`_stitch.${namespace}.${USER_AUTH_KEY}`)).toEqual(42);
      expect(storage.store.getItem(`_stitch.${namespace}.${REFRESH_TOKEN_KEY}`)).toEqual(84);

      await _runReverseMigration(undefined, storage);

      expect(storage.store.getItem(USER_AUTH_KEY)).toEqual(42);
      expect(storage.store.getItem(REFRESH_TOKEN_KEY)).toEqual(84);
    });
  }

  it('should keep a "StitchClient" logged in after a migration', async() => {
    const test = new StitchMongoFixture();
    await test.setup();
    const { apiKey, groupId, serverUrl } = extractTestFixtureDataPoints(test);

    const th = await buildClientTestHarness(apiKey, groupId, serverUrl);
    let client = th.stitchClient;

    await _runReverseMigration(null, client.auth.storage);

    // this client will be running the migrated storage
    client = await StitchClientFactory.create(client.clientAppID);

    // if the authId is defined, we're still logged in
    expect(await client.authedId).toBeDefined();

    await th.cleanup();
    await test.teardown();
  });

  it('should migrate existing values from undefined version to version 1', async() => {
    let memoryStorage = new MemoryStorage();

    memoryStorage.setItem(USER_AUTH_KEY, 16);
    memoryStorage.setItem(REFRESH_TOKEN_KEY, 32);
    memoryStorage.setItem(DEVICE_ID_KEY, 64);
    memoryStorage.setItem(STATE_KEY, 128);

    expect(memoryStorage.getItem(USER_AUTH_KEY)).toEqual(16);
    expect(memoryStorage.getItem(REFRESH_TOKEN_KEY)).toEqual(32);
    expect(memoryStorage.getItem(DEVICE_ID_KEY)).toEqual(64);
    expect(memoryStorage.getItem(STATE_KEY)).toEqual(128);

    const storage = createStorage({
      storageType: 'customStorage',
      storage: memoryStorage,
      namespace
    });

    expect(await storage.get(USER_AUTH_KEY)).toEqual(16);
    expect(await storage.get(REFRESH_TOKEN_KEY)).toEqual(32);
    expect(await storage.get(DEVICE_ID_KEY)).toEqual(64);
    expect(await storage.get(STATE_KEY)).toEqual(128);

    expect(storage.store.getItem(USER_AUTH_KEY)).toBeNull();
    expect(storage.store.getItem(REFRESH_TOKEN_KEY)).toBeNull();
    expect(storage.store.getItem(DEVICE_ID_KEY)).toBeNull();
    expect(storage.store.getItem(STATE_KEY)).toBeNull();
  });
});


