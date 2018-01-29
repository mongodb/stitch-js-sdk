'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.MemoryStorage = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

exports.createStorage = createStorage;

var _common = require('./common');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var MemoryStorage = exports.MemoryStorage = function () {
  function MemoryStorage() {
    _classCallCheck(this, MemoryStorage);

    this._data = {};
    this._orderedKeys = [];
    this.length = 0;
  }

  _createClass(MemoryStorage, [{
    key: 'getItem',
    value: function getItem(key) {
      return key in this._data ? this._data[key] : null;
    }
  }, {
    key: 'setItem',
    value: function setItem(key, value) {
      this._orderedKeys.push(key);
      this._data[key] = value;
      this.length++;
      return this._data[key];
    }
  }, {
    key: 'removeItem',
    value: function removeItem(key) {
      this._orderedKeys.pop(key);
      delete this._data[key];
      this.length--;
      return undefined;
    }
  }, {
    key: 'key',
    value: function key(index) {
      return this._orderedKeys[index];
    }
  }]);

  return MemoryStorage;
}();

var _VERSION = 1;
var _VERSION_KEY = '__stitch_storage_version__';

/**
  * Run a migration on the currently used storage
  * that checks to see if the current version is up to date.
  * If the version has not been set, this method will migrate
  * to the latest version.
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
      var migrations = [_common.USER_AUTH_KEY, _common.REFRESH_TOKEN_KEY, _common.DEVICE_ID_KEY, _common.STATE_KEY].map(function (key) {
        return Promise.resolve(storage.store.getItem(key)).then(function (item) {
          return !!item && storage.store.setItem(storage._generateKey(key), item);
        }).then(function () {
          return storage.store.removeItem(key);
        });
      });
      return Promise.all(migrations).then(function () {
        return storage.store.setItem(_VERSION_KEY, _VERSION);
      });
    // in future versions, `case 1:`, `case 2:` and so on
    // could be added to perform similar migrations
    default:
      break;
  }
}

var Storage = function () {
  /**
   * @param {Storage} store implementer of Storage interface
   * @param {String} namespace clientAppID to be used for namespacing
   * @param
  */
  function Storage(store, namespace) {
    var _this = this;

    _classCallCheck(this, Storage);

    this.store = store;
    this.namespace = '_stitch.' + namespace;

    this._migration = Promise.resolve(this.store.getItem(_VERSION_KEY)).then(function (version) {
      return _runMigration(version, _this);
    });
  }

  _createClass(Storage, [{
    key: '_generateKey',
    value: function _generateKey(key) {
      return this.namespace + '.' + key;
    }
  }, {
    key: 'get',
    value: function get(key) {
      var _this2 = this;

      return Promise.resolve(this._migration).then(function () {
        return _this2.store.getItem(_this2._generateKey(key));
      });
    }
  }, {
    key: 'set',
    value: function set(key, value) {
      var _this3 = this;

      return Promise.resolve(this._migration).then(function () {
        return _this3.store.setItem(_this3._generateKey(key), value);
      }).then(function () {
        return value;
      });
    }
  }, {
    key: 'remove',
    value: function remove(key) {
      var _this4 = this;

      return Promise.resolve(this._migration).then(function () {
        return _this4.store.removeItem(_this4._generateKey(key));
      });
    }
  }]);

  return Storage;
}();

function createStorage(options) {
  var storageType = options.storageType,
      storage = options.storage,
      namespace = options.namespace;


  if (storageType === 'localStorage') {
    if (typeof window !== 'undefined' && 'localStorage' in window && window.localStorage !== null) {
      return new Storage(window.localStorage, namespace);
    }
  } else if (storageType === 'sessionStorage') {
    if (typeof window !== 'undefined' && 'sessionStorage' in window && window.sessionStorage !== null) {
      return new Storage(window.sessionStorage, namespace);
    }
  } else if (storageType == 'customStorage') {
    //eslint-disable-line eqeqeq
    return new Storage(storage, namespace);
  }

  // default to memory storage
  return new Storage(new MemoryStorage(), namespace);
}