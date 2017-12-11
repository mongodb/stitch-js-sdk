class MemoryStorage {
  constructor() {
    this._data = {};
  }

  async getItem(key) {
    return (key in this._data) ? this._data[key] : null;
  }

  async setItem(key, value) {
    this._data[key] = value;
    return this._data[key];
  }

  async removeItem(key) {
    delete this._data[key];
    return undefined;
  }

  async clear() {
    this._data = {};
    return this._data;
  }
}

class Storage {
  constructor(store) {
    this.store = store;
  }

  async get(key) { return this.store.getItem(key); }
  async set(key, value) { return this.store.setItem(key, value); }
  async remove(key) { return this.store.removeItem(key); }
  async clear() { return this.store.clear(); }
}

export function createStorage(options) {
  let { storageType, storage } = options;
  if (storageType === 'localStorage') {
    if ((typeof window !== 'undefined') && 'localStorage' in window && window.localStorage !== null) {
      return new Storage(window.localStorage);
    }
  } else if (storageType === 'sessionStorage') {
    if ((typeof window !== 'undefined') && 'sessionStorage' in window && window.sessionStorage !== null) {
      return new Storage(window.sessionStorage);
    }
  } else if (storageType == 'customStorage') { //eslint-disable-line eqeqeq
    return new Storage(storage);
  }

  // default to memory storage
  return new Storage(new MemoryStorage());
}
