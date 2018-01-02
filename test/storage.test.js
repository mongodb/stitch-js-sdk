/* eslint no-loop-func: 0 */
import { createStorage } from '../src/auth/storage';
import { mocks } from 'mock-browser';
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
  }
});
