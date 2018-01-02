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
  /**
   * @param {Storage} store implementer of Storage interface
   * @param {String} namespace appID to be used for namespacing
  */
  constructor(store, namespace) {
    this.store = store;
    this.namespace = namespace;
  }

  get(key) { return new Promise(resolve => resolve(this.store.getItem(`${this.namespace}.${key}`))); }
  set(key, value) { return new Promise(resolve => resolve(this.store.setItem(`${this.namespace}.${key}`, value))); }
  remove(key) { return new Promise(resolve => resolve(this.store.removeItem(`${this.namespace}.${key}`))); }
  clear() { return new Promise(resolve => resolve(this.store.clear())); }
}

export function createStorage(options) {
  let { storageType, storage, namespace } = options;
  if (storageType === 'localStorage') {
    if ((typeof window !== 'undefined') && 'localStorage' in window && window.localStorage !== null) {
      return new Storage(window.localStorage, namespace);
    }
  } else if (storageType === 'sessionStorage') {
    if ((typeof window !== 'undefined') && 'sessionStorage' in window && window.sessionStorage !== null) {
      return new Storage(window.sessionStorage, namespace);
    }
  } else if (storageType == 'customStorage') { //eslint-disable-line eqeqeq
    return new Storage(storage, namespace);
  }

  // default to memory storage
  return new Storage(new MemoryStorage(), namespace);
}
