// @flow
interface IStorage {
  getItem(key: string): Promise<any>;
  setItem(key: string, value: any): Promise<any>;
  removeItem(key: string): Promise<void>;
  clear(): Object;
}

class MemoryStorage implements IStorage {
  _data: Object;

  constructor() {
    this._data = {};
  }

  async getItem(key): Promise<any> {
    return (key in this._data) ? this._data[key] : null;
  }

  async setItem(key, value): Promise<any> {
    this._data[key] = value;
    return this._data[key];
  }

  async removeItem(key): Promise<void> {
    delete this._data[key];
  }

  async clear(): Object {
    this._data = {};
    return this._data;
  }
}

export class Storage {
  store: IStorage;
  constructor(store: IStorage) {
    this.store = store;
  }

  async get(key: string) { return this.store.getItem(key); }
  async set(key: string, value: any) { return this.store.setItem(key, value); }
  async remove(key: any) { return this.store.removeItem(key); }
  async clear() { return this.store.clear(); }
}

export function createStorage(options: Object): Storage {
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
