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
    it(`should save token to ${storageType}`, () => {
      const storage = createStorage(storageType);
      storage.set('token', 'foo');
      expect(storage.get('token')).toEqual('foo');
    });

    it(`should remove token to ${storageType}`, () => {
      const storage = createStorage(storageType);
      storage.remove('token');
      expect(storage.get('token')).toBeNull();
    });
  }
});
