/* eslint no-loop-func: 0 */
const StitchMongoFixture = require('./fixtures/stitch_mongo_fixture');

import { createStorage, MemoryStorage } from '../src/auth/storage';
import { mocks } from 'mock-browser';
import { StitchClient } from '../src/index';
import { buildClientTestHarness, extractTestFixtureDataPoints } from './testutil';

const MockBrowser = mocks.MockBrowser;

const storageTypes = [ 'localStorage', 'sessionStorage', 'fallback' ];

// for testing purposes only
function _runReverseMigration(toVersion, storage) {
  switch (toVersion) {
    case null:
    case undefined:
      let reverseMigrations = [];
      for (var i = 0; i < storage.store.length; i++) {
        const key = storage.store.key(i);
        reverseMigrations.push(new Promise((resolve) => resolve(storage.store.getItem(key)))
          .then(item => {
            let newKey = key
            if (key.indexOf(storage.namespace) >= 0) {
              newKey = key.split('.').pop();
            }
            return storage.store.setItem(newKey, item) })
          .then(item => storage.store.removeItem(key))
        );
      }
      return Promise.all(reverseMigrations)
        .then(() => storage.store.setItem('__storage_version__', toVersion))
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
    it(`should save token to ${storageType}`, async () => {
      const storage = createStorage(storageType);
      await storage.set('token', 'foo');
      expect(await storage.get('token')).toEqual('foo');
    });

    it(`should remove token to ${storageType}`, async () => {
      const storage = createStorage(storageType);
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

    it(`should allow for two unique clients to coexist for ${storageType}`, async () => {
      const client1 = new StitchClient('test-app1');
      const client2 = new StitchClient('test-app2');

      const ogAuth1 = JSON.parse(await client1.auth.set({
        'access_token': 'quux',
        'refresh_token': 'corge',
        'device_id': 'uier',
        'user_id': 'grault'
      }));
      const ogAuth2 = JSON.parse(await client2.auth.set({
        'access_token': 'foo',
        'refresh_token': 'bar',
        'device_id': 'baz',
        'user_id': 'qux'
      }));

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

      await storage.set('foo', 42);
      await storage.set('bar', 84);

      expect(await storage.get('foo')).toEqual(42);
      expect(await storage.get('bar')).toEqual(84);

      expect(storage.store.getItem(`${namespace}.foo`)).toEqual(42);
      expect(storage.store.getItem(`${namespace}.bar`)).toEqual(84);

      await _runReverseMigration(undefined, storage);

      expect(storage.store.getItem('foo')).toEqual(42);
      expect(storage.store.getItem('bar')).toEqual(84);
    });

    it(`should keep a 'StitchClient' logged in after a migration for ${storageType}`, async() => {
      const test = new StitchMongoFixture();
      await test.setup();
      const { apiKey, groupId, serverUrl } = extractTestFixtureDataPoints(test);

      const th = await buildClientTestHarness(apiKey, groupId, serverUrl);
      let client = th.stitchClient;
      await client.authenticate('anon');

      await _runReverseMigration(null, client.auth.storage);

      // this client will be running the migrated storage
      client = new StitchClient(client.clientAppID);

      // if the authId is defined, we're still logged in
      expect(await client.authedId).toBeDefined();

      await th.cleanup();
      await test.teardown();
    });
  }

  it(`should migrate existing values`, async() => {
    const version = undefined;

    let memoryStorage = new MemoryStorage();

    memoryStorage.setItem('foo', 42);
    memoryStorage.setItem('bar', 84);

    expect(memoryStorage.getItem('foo')).toEqual(42);
    expect(memoryStorage.getItem('bar')).toEqual(84);

    const storage = createStorage({ 
      storageType: 'customStorage', 
      storage: memoryStorage, 
      namespace
    });

    expect(await storage.get('foo')).toEqual(42);
    expect(await storage.get('bar')).toEqual(84);

    expect(storage.store.getItem('foo')).toBeNull();
    expect(storage.store.getItem('bar')).toBeNull();
  });
});


