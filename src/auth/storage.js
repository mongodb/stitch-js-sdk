class MemoryStorage {
  constructor() {
    this._data = {};
  }

  getItem(key) {
    return (key in this._data) ? this._data[key] : null;
  }

  setItem(key, value) {
    this._data[key] = value;
    return this._data[key];
  }

  removeItem(key) {
    delete this._data[key];
    return undefined;
  }

  clear() {
    this._data = {};
    return this._data;
  }
}

class Storage {
  constructor(store) {
    this.store = store;
  }

  get(key) { return new Promise(resolve => resolve(this.store.getItem(key))); }
  set(key, value) { return new Promise(resolve => resolve(this.store.setItem(key, value))); }
  remove(key) { return new Promise(resolve => resolve(this.store.removeItem(key))); }
  clear() { return new Promise(resolve => resolve(this.store.clear())); }
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
