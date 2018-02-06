import { USER_AUTH_KEY, REFRESH_TOKEN_KEY, DEVICE_ID_KEY, STATE_KEY } from './common';

export class MemoryStorage {
  constructor() {
    this._data = {};
    this._orderedKeys = [];
    this.length = 0;
  }

  getItem(key) {
    return (key in this._data) ? this._data[key] : null;
  }

  setItem(key, value) {
    this._orderedKeys.push(key);
    this._data[key] = value;
    this.length++;
    return this._data[key];
  }

  removeItem(key) {
    this._orderedKeys.pop(key);
    delete this._data[key];
    this.length--;
    return undefined;
  }

  key(index) {
    return this._orderedKeys[index];
  }
}

const _VERSION = 1;
const _VERSION_KEY = '__stitch_storage_version__';

/**
  * Run a migration on the currently used storage
  * that checks to see if the current version is up to date.
  * If the version has not been set, this method will migrate
  * to the latest version.
  *
  * @private
  * @param {Integer} version version number of storage
  * @param {Object} storage storage class being checked
  * @returns {Promise} nullable promise containing migration logic
  */
function _runMigration(version, storage) {
  switch (version) {
  case null:
  case undefined:
    // return a promise,
    // mapping each of the store's keys to a Promise
    // that fetches the each value for each key,
    // sets the old value to the new "namespaced" key
    // remove the old key value pair,
    // and set the version number
    let migrations = [
      USER_AUTH_KEY,
      REFRESH_TOKEN_KEY,
      DEVICE_ID_KEY,
      STATE_KEY
    ].map(key =>
      Promise.resolve(storage.store.getItem(key))
        .then(item => !!item && storage.store.setItem(storage._generateKey(key), item))
        .then(() => storage.store.removeItem(key))
    );
    return Promise.all(migrations)
      .then(() => storage.store.setItem(_VERSION_KEY, _VERSION));
  // in future versions, `case 1:`, `case 2:` and so on
  // could be added to perform similar migrations
  default: break;
  }
}

/** @private */
class Storage {
  /**
   * @param {Storage} store implementer of Storage interface
   * @param {String} namespace clientAppID to be used for namespacing
   * @param
  */
  constructor(store, namespace) {
    this.store = store;
    this.namespace = `_stitch.${namespace}`;

    this._migration = Promise.resolve(this.store.getItem(_VERSION_KEY))
      .then(version => _runMigration(version, this));
  }

  _generateKey(key) {
    return `${this.namespace}.${key}`;
  }

  get(key) {
    return Promise.resolve(this._migration)
      .then(() => this.store.getItem(this._generateKey(key)));
  }

  set(key, value) {
    return Promise.resolve(this._migration)
      .then(() => this.store.setItem(this._generateKey(key), value))
      .then(() => value);
  }

  remove(key) {
    return Promise.resolve(this._migration)
      .then(() => this.store.removeItem(this._generateKey(key)));
  }
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
