/* eslint no-loop-func: 0 */
import { createStorage } from '../src/auth/storage';
import { mocks } from 'mock-browser';
import { StitchClient } from '../src/index';

const MockBrowser = mocks.MockBrowser;

const storageTypes = [ 'localStorage', 'sessionStorage', 'fallback' ];

describe('storage', function() {
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

      await client2.auth.storage.clear();
      expect(await client2.auth._get()).toEqual({});
      expect(await client2.auth.getDeviceId()).toBeNull();
      expect(await client1.auth.getDeviceId()).toBeDefined();
    });
  }
});
