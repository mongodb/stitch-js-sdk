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
   * @param {String} namespace clientAppID to be used for namespacing
  */
  constructor(store, namespace) {
    this.store = store;
    this.namespace = namespace;
    this._keySetKey = `_${this.namespace}.keys`
  }
  
  _generateKey(key) {
    return `${this.namespace}.${key}`
  }
  _saveKeyToKeySet(generatedKey) {
    return this._getKeySet().then(keySet => {
      keySet.push(generatedKey);
      return this.store.setItem(this._keySetKey, keySet);
    });
  }
  _removeKeyFromKeySet(generatedKey) {
    return this._getKeySet().then(keySet => {
      keySet.pop(generatedKey)
      return this.store.setItem(this._keySetKey, keySet);
    })
  }
  _getKeySet() {
    return new Promise(resolve => 
      resolve(this.store.getItem(this._keySetKey))
    ).then(keySet => {
      return !keySet ? [] : keySet
    });
  }

  get(key) {
    return new Promise(resolve => 
      resolve(this.store.getItem(this._generateKey(key)))
    ); 
  }

  set(key, value) {
    const generatedKey = this._generateKey(key);
    return new Promise(resolve =>
      resolve(this._saveKeyToKeySet(generatedKey))
    ).then(() => {
      return this.store.setItem(generatedKey, value);
    }).catch(() => {
      return this._removeKeyFromKeySet(generatedKey);
    }); 
  }

  remove(key) { 
    const generatedKey = this._generateKey(key);
    return new Promise(resolve =>
      resolve(this.store.removeItem(generatedKey))
    ).then(() => {
      return this._removeKeyFromKeySet(generatedKey);
    }); 
  }

  clear() { 
    return this._getKeySet().then(keySet =>
      Promise.all(
        [].concat(keySet.map(key => 
          [new Promise(resolve => 
            resolve(this.store.removeItem(key))
          ), 
          this._removeKeyFromKeySet(key)]
        ))
      )
    );
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
